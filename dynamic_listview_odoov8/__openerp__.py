{
    'name': 'Dynamic ListView Advance Odoo 8',
    'summary': 'Change The Odoo List view On the fly without any technical knowledge',
    'version': '1.0',
    'category': 'Web',
    'description': """

    """,
    'author': "Odoo AZ",
    'depends': ['web'],
    'data': ['templates.xml',
             'security/show_fields_security.xml',
             'security/ir.model.access.csv'],
    'price': 199.00,
    'currency': 'EUR',
    'installable': True,
    'auto_install': False,
    'application': False,
    'qweb': ['static/src/xml/listview_button_view.xml'],
    'images': [
        'images/listview_v8.png',
    ],
}
