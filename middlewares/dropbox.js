import { Dropbox } from "dropbox";
import fs from 'fs';
import path from "path";
import axios from 'axios';

// Dropbox configuration
const DROPBOX_CONFIG = {
    maxFileSize: 150 * 1024 * 1024, // 150MB
    allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
    ],
    uploadPath: '/products', // Organize uploads in a products folder
    tokenRefreshInterval: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    oauth: {
        clientId: process.env.DROPBOX_CLIENT_ID,
        clientSecret: process.env.DROPBOX_CLIENT_SECRET,
        refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
        tokenEndpoint: 'https://api.dropboxapi.com/oauth2/token'
    }
};

// Initialize Dropbox client with error handling
let dbx;
let lastTokenCheck = 0;
let currentAccessToken = process.env.DB_TOKEN;

// Function to refresh the access token
const refreshAccessToken = async () => {
    try {
        console.log('Attempting to refresh Dropbox token...');
        
        // Validate required credentials
        if (!DROPBOX_CONFIG.oauth.clientId || !DROPBOX_CONFIG.oauth.clientSecret || !DROPBOX_CONFIG.oauth.refreshToken) {
            throw new Error('Missing required Dropbox OAuth credentials');
        }

        const response = await axios.post(DROPBOX_CONFIG.oauth.tokenEndpoint, 
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: DROPBOX_CONFIG.oauth.refreshToken,
                client_id: DROPBOX_CONFIG.oauth.clientId,
                client_secret: DROPBOX_CONFIG.oauth.clientSecret
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        if (response.data.access_token) {
            currentAccessToken = response.data.access_token;
            dbx = new Dropbox({ accessToken: currentAccessToken });
            lastTokenCheck = Date.now();
            console.log('Dropbox access token refreshed successfully');
            return true;
        } else {
            console.error('No access token in refresh response:', response.data);
            return false;
        }
    } catch (error) {
        console.error('Failed to refresh Dropbox token:', {
            error: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: {
                clientId: DROPBOX_CONFIG.oauth.clientId ? 'present' : 'missing',
                clientSecret: DROPBOX_CONFIG.oauth.clientSecret ? 'present' : 'missing',
                refreshToken: DROPBOX_CONFIG.oauth.refreshToken ? 'present' : 'missing'
            }
        });
        return false;
    }
};

// Function to check and refresh token if needed
const checkAndRefreshToken = async () => {
    const now = Date.now();
    if (now - lastTokenCheck > DROPBOX_CONFIG.tokenRefreshInterval) {
        try {
            // Try a simple API call to check token validity
            await dbx.checkUser();
            lastTokenCheck = now;
        } catch (error) {
            if (error.status === 401) {
                console.log('Token expired, attempting to refresh...');
                const refreshed = await refreshAccessToken();
                if (!refreshed) {
                    throw new Error('Failed to refresh Dropbox access token. Please check your refresh token and credentials.');
                }
            } else {
                throw error;
            }
        }
    }
};

// Initialize Dropbox client
const initializeDropboxClient = () => {
    try {
        if (!currentAccessToken) {
            throw new Error('Dropbox access token is not configured');
        }
        if (!DROPBOX_CONFIG.oauth.refreshToken) {
            throw new Error('Dropbox refresh token is not configured');
        }
        dbx = new Dropbox({ accessToken: currentAccessToken });
        lastTokenCheck = Date.now();
        console.log('Dropbox client initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Dropbox client:', error);
        throw new Error('Dropbox service initialization failed');
    }
};

// Initialize on module load
initializeDropboxClient();

export const uploadFileToDropbox = async (filePath) => {
   try {
        // Check token validity before proceeding
        await checkAndRefreshToken();

        // Validate file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at path: ${filePath}`);
        }

        // Validate file is readable
        try {
            fs.accessSync(filePath, fs.constants.R_OK);
        } catch (err) {
            throw new Error(`File is not readable at path: ${filePath}`);
        }

        // Get file stats and validate
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
            throw new Error('File is empty');
        }

        // Validate file size
        if (stats.size > DROPBOX_CONFIG.maxFileSize) {
            throw new Error(`File size exceeds ${DROPBOX_CONFIG.maxFileSize / (1024 * 1024)}MB limit`);
        }

        const normalizedPath = filePath.replace(/\\/g, '/');
        const fileName = path.basename(normalizedPath);
        
        // Generate unique filename with timestamp and random string
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const uniqueFileName = `${timestamp}-${randomString}-${fileName}`;
        
        // Log upload attempt
        console.log("Starting Dropbox upload:", {
            originalFileName: fileName,
            uniqueFileName,
            filePath,
            normalizedPath,
            fileSize: stats.size,
            mimeType: path.extname(fileName)
        });

        // Read and validate file content
        const fileContent = fs.readFileSync(filePath);
        if (!fileContent || fileContent.length === 0) {
            throw new Error('File content is empty');
        }

        // Upload to Dropbox with retry logic
        let retryCount = 0;
        const maxRetries = 3;
        let response;

        while (retryCount < maxRetries) {
            try {
                response = await dbx.filesUpload({
                    path: `${DROPBOX_CONFIG.uploadPath}/${uniqueFileName}`,
                    contents: fileContent,
                    mode: { '.tag': 'add' },
                    autorename: true,
                });
                break;
            } catch (error) {
                retryCount++;
                if (retryCount === maxRetries) {
                    throw error;
                }
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            }
        }

        console.log("Dropbox upload success:", {
            fileName: uniqueFileName,
            path: response.result.path_display,
            size: response.result.size
        });

        return response.result;
   } catch (error) {
        console.error('Dropbox upload error:', {
            error: error.message,
            stack: error.stack,
            filePath,
            errorType: error.constructor.name,
            errorDetails: error.error || error
        });
        
        // Clean up the local file after failed upload
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (cleanupError) {
            console.error('Failed to clean up local file:', cleanupError);
        }
        
        // Provide more specific error messages
        if (error.status === 400) {
            throw new Error(`Invalid request to Dropbox: ${error.message}. Please check file format and size.`);
        } else if (error.status === 401) {
            throw new Error('Dropbox authentication failed. Token refresh failed. Please check your credentials.');
        } else if (error.status === 403) {
            throw new Error('Access denied to Dropbox. Please check your permissions.');
        } else if (error.status === 507) {
            throw new Error('Dropbox storage quota exceeded.');
        } else {
            throw new Error(`Failed to upload file to Dropbox: ${error.message}`);
        }
   }
}
