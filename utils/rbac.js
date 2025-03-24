export const permissions = [
    {
        role: 'user',
        actions: [
            'get_profile',
            'update_profile',
            'get_product'
        ]
    },
    {
        role: 'admin',
        actions: [
            'get_profile',
            'update_profile',
            'add_product',
            'update_product',
            'get_product',
            'delete_product'
        ]
    },
    {
        role: 'superadmin',
        actions: [
            'get_profile',
            'update_profile',
            'delete_profile',
            'add_product',
            'update_product',
            'get_product',
            'delete_product'
        ]
    }
]