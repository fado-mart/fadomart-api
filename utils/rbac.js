export const permissions = [
    {
        role: 'User',
        actions: [
            'get_profile',
            'update_profile',
            'get_product'
        ]
    },
    {
        role: 'Admin',
        actions: [
            'get_profile',
            'get_profiles',
            'update_profile',
            'add_product',
            'update_product',
            'get_product',
            'delete_product',
            'add_category',
            'update_category',
            'delete_category',
            'get_userOders',
            'update_orderStatus'
        ]
    },
    {
        role: 'superadmin',
        actions: [
            'get_profile',
            'get_profiles',
            'update_profile',
            'delete_profile',
            'add_product',
            'update_product',
            'get_product',
            'delete_product',
            'add_category',
            'update_category',
            'delete_category',
            'get_userOders',
            'update_orderStatus'
        ]
    }
]