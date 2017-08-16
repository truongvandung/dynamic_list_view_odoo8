# __author__ = 'truongdung'
from openerp import fields, api, models
import json


class ShowFieldS(models.Model):
    _name = "show.fields"

    user_id = fields.Many2one(comodel_name="res.users", string="User Id")
    name = fields.Char(string="Name")
    model_name = fields.Char(string="Model Name")
    color = fields.Char(string="Color", default="check-base")
    fields_show = fields.Char(string="Fields Show")
    all_user = fields.Boolean(string="Fix header List View")
    fields_sequence = fields.Char(string="Sequence")
    color_for_list = fields.Boolean(string="Use Color/bgcolor for listview")
    fields_string = fields.Char(string="Fields String")
    # background_color = fields.Char(string="Background Color of ListView")
    # color_list_view = fields.Char(string="Color of ListView")

    @api.model
    def action(self, vals, action):
        group_show_fields = self.env.ref('dynamic_listview_odoov8.group_show_fields')
        if group_show_fields.id not in [x.id for x in self.env.user.groups_id]:
            self.env.user.write({'in_group_%s' % group_show_fields.id: True})
            # group_show_fields.write({'users': [[6, False,
            #                                     [x.id for x in group_show_fields.users]+[vals['user_id']]]]})
        if 'user_id' in vals and 'model_name' in vals:
            data = self.search([('user_id', '=', 1), ('model_name', '=', vals['model_name'])])

            if len(data) > 0 and data[0].all_user:
                data[0].user_id = vals['user_id']
            else:
                data = self.search([('user_id', '=', vals['user_id']), ('model_name', '=', vals['model_name'])])
            if action == 'update':
                if 'fields_show' in vals:
                    vals['fields_show'] = str(vals['fields_show'])
                    if len(data) > 0:
                        data[0].write({'fields_show': vals['fields_show'], 'fields_sequence': vals['fields_sequence'],
                                       'fields_string': vals['fields_string']})
                    else:
                        self.create(vals)
                else:
                    if len(data) > 0:
                        data[0].write({'color': vals['color'], 'all_user': vals['all_user'],
                                       'color_for_list': vals['color_for_list']})
                    else:
                        self.create(vals)
            elif action == 'select':
                all_field_obj = self.env[vals['model_name']].fields_get()
                if len(data) > 0:
                    data = data[0]
                    return {'data': {'user_id': data.user_id.id, 'color': data.color, 'model_name': data.model_name,
                                     'fields_show': data.fields_show, 'id': data.id, 'name': data.name,
                                     'fields_sequence': data.fields_sequence,
                                     'all_user': data.all_user,
                                     'color_for_list': data.color_for_list,
                                     'fields_string': data.fields_string},
                            'fields': all_field_obj}
                else:
                    return {'data': {}, 'fields': all_field_obj}

ShowFieldS()
