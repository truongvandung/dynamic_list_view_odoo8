view_list_inherit = function(instance) {
    var _t = instance.web._t,
    _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    instance.web.View.include({
        load_view: function(context) {
            var self = this;
            var view_loaded_def;
            if (!this.options.new_window){
                new instance.web.Model('show.fields').get_func('action')({'model_name': self.model, 'user_id': self.session.uid}, 'select').then(function (result){
                    self.result = result;
                });
            }
            if (this.embedded_view) {
                view_loaded_def = $.Deferred();
                $.async_when().done(function() {
                    view_loaded_def.resolve(self.embedded_view);
                });
            }else {
                if (! this.view_type){
                    console.warn("view_type is not defined", this);
                    }
                view_loaded_def = instance.web.fields_view_get({
                    "model": this.dataset._model,
                    "view_id": this.view_id,
                    "view_type": this.view_type,
                    "toolbar": !!this.options.$sidebar,
                    "context": this.dataset.get_context(),
                });
            }
            return this.alive(view_loaded_def).then(function(r) {
                self.fields_view = r;
                self.render_fields_show();
                // add css classes that reflect the (absence of) access rights
                self.$el.addClass('oe_view')
                    .toggleClass('oe_cannot_create', !self.is_action_enabled('create'))
                    .toggleClass('oe_cannot_edit', !self.is_action_enabled('edit'))
                    .toggleClass('oe_cannot_delete', !self.is_action_enabled('delete'));
                return $.when(self.view_loading(r)).then(function() {
//                    self.render_fields_show();
                    self.trigger('view_loaded', r);
                });
            });
        },
        render_fields_show: function () {
            var self = this;
            if (this.fields_view.type == 'tree' && typeof(this.result) != 'undefined'){
                var Show_Field = new instance.web.Model('show.fields');
                QWeb.add_template("/dynamic_listview_odoov8/static/src/xml/my_control.xml");
                    String.prototype.replaceAll = function(target, replacement) {return this.split(target).join(replacement); };
                    var data_show_field = this.result.data || {};
                    self.data_show_field = data_show_field;
                    var all_fields_of_model = this.result.fields || {};
                    self.all_fields_of_model = all_fields_of_model;

                    var fields = self.fields_view.fields;
                    var children = self.fields_view.arch.children;

                    this._visible_columns = _.filter(this.fields_view.arch.children, function (column) {return column.attrs.invisible != '1'})

                    var field_visible = data_show_field.hasOwnProperty('fields_show') && data_show_field['fields_show'] ? eval(data_show_field['fields_show'].replaceAll("u'", "'")) : _.pluck(_.pluck(self._visible_columns, 'attrs'), 'name');
                    var fields_sequence = data_show_field.hasOwnProperty('fields_sequence') && data_show_field['fields_sequence'] ? JSON.parse(data_show_field['fields_sequence']) : {}
                    var fields_string = data_show_field.hasOwnProperty('fields_string') && data_show_field['fields_string'] ? JSON.parse(data_show_field['fields_string']) : {}

                    var list_data = [];

                    for (var field_name in all_fields_of_model){
                        var field_obj = all_fields_of_model[field_name];
                        var data = {value: field_name, string: field_obj.string}
                        if (field_visible.indexOf(field_name) >= 0){
                            data['checked'] = 'checked';
                            if (fields_sequence.hasOwnProperty(field_name)){
                               data['sequence'] = fields_sequence[field_name];
                            }
                            if (fields_string.hasOwnProperty(field_name)){
                                data['string'] = fields_string[field_name];
                            }
                        }
                        list_data.push(data);
                    }
                    list_data = _.sortBy(list_data, function (o){return o.sequence});
                    self.data = {suggestion: list_data, attrs: {color: data_show_field.color || 'check-primary'}}

                    var field = {}, children = [], _fields_show = [];
                    for (var idx in field_visible){
                        var _field = field_visible[idx];
                        _fields_show.push({'value': _field, 'sequence': fields_sequence[_field] || 100});
                    }
                    _fields_show = _.sortBy(_fields_show, function (o){return o.sequence});

                    for (var _field in _fields_show){
                        _field = _fields_show[_field];
                        children.push({attrs: {modifiers: "", name: _field.value}, children: [], tag: "field"});
                        var f = all_fields_of_model[_field.value];
                        if (fields_string.hasOwnProperty(_field.value)){
                            f.string = fields_string[_field.value];
                        }
                        field[_field.value] = f;
                    }

                    // prepare children
                    var _children = self.fields_view.arch.children
                    for (var _field in _children){
                        if (_children.hasOwnProperty(_field)){
                            _field = _children[_field]
                            if ((!field.hasOwnProperty(_field.attrs.name) && _field.attrs.invisible == '1') || _field.attrs.name == 'state' || _field.attrs.name == 'virtual_available'){
                                field[_field.attrs.name] = all_fields_of_model[_field.attrs.name]
                                children.push(_field);
                            }
                        }
                    }
                    self.fields_view.fields = field;
                    self.fields_view.arch.children = children;
            }
        }
    });

   instance.web.ListView.include({
       load_list: function(data) {
           this._super(data);
           if (typeof(this.ok) == "undefined"){
                this.ok = false;
           }
           if (this.$buttons && !this.ok) {
               this.ok = true;
               this.ViewManager.$el.find(".toggle_select_field").click(function() {
                   $(this).next().toggle();
               });
               this.ViewManager.$el.find(".sequence").change(function () {
                    $(this).parents('.setting_field').next('input').attr({'sequence': $(this).val()});
               });
               this.ViewManager.$el.find(".string_field").change(function () {
                    $(this).parents('.setting_field').next('input').attr({'string_field': $(this).val()});
               });
               this.ViewManager.$el.find("i[setting]").click(function () {
                    $(this).parent().find('.setting_field').toggle();
               });
               this.ViewManager.$el.find(".update_setting_field").click(function () {
                   var parent = $(this).parents('.setting_field');
                   parent.next().attr({string_field: parent.find('.string_field').val(), 'sequence': parent.find('.sequence').val()})
                   parent.toggle();
               });
               this.setting_fields_show(this.options.$buttons);
               this.update_show_fields(this.options.$buttons);
           }

       },
        update_show_fields: function (node) {
            var self = this;
            if (typeof(node) != 'undefined'){
                node.find('a[action="update"]').click(function () {
                    var fields = []
                    var sequence = {}
                    var fields_string = {}
                    self.$buttons.find('.choose_field_show').find('.suggestion input:checked').each(function () {
                        fields.push($(this).val());
                        var _seq = $(this).attr('sequence') || false;
                        if (_seq){
                            sequence[$(this).attr('id')] = parseInt(_seq);
                        }
                        var _str = $(this).attr('string_field') || false;
                        if (_str){
                            fields_string[$(this).attr('id')] = _str;
                        }
                    });
                    new instance.web.Model('show.fields').call('action', [{'model_name': self.model, 'fields_show': fields,
                    'user_id': self.session.uid, 'fields_sequence': JSON.stringify(sequence),
                    'fields_string': JSON.stringify(fields_string)}, 'update']).then(function (result) {
                        location.reload();
                    });
                });
            }
        },
        setting_fields_show: function (node) {
            var self = this;
            if (typeof(node) != 'undefined'){
                node.find(".fields_setting").click(function () {
                    var $form_show = $(QWeb.render('FormShowField', self.data_show_field));
    //  set data for form
                    $form_show.find('input[name="color"][value="'+(self.data_show_field.color || 'check-primary')+'"]').attr('checked', true);
                    if (self.data_show_field.all_user){
                        $form_show.find('#all_user').attr('checked', true);
                    }
                    if (self.data_show_field.color_for_list){
                        $form_show.find('#color_for_list').attr('checked', true);
                    }
    //                insert to body
                    $form_show.insertAfter('body');

    //                events
                    $('.close-field-show').click(function () {
                        $form_show.remove();
                    });
                    $form_show.find('a[action="update"]').click(function () {
                        var data = {color: $form_show.find('input[name="color"]:checked').val(),
                                    all_user: false, color_for_list: false, model_name: self.model,
                                    user_id: self.session.uid}
                        if ($form_show.find('#all_user').is(':checked')){
                            data.all_user = true;
                        }
                        if ($form_show.find('#color_for_list').is(':checked')){
                            data.color_for_list = true;
                        }
                        new instance.web.Model('show.fields').call('action', [data, 'update']).then(function (result) {
                            location.reload();
                        });
                    });
                });
            }
        }
    });
};

openerp.dynamic_listview_odoov8 = function(instance) {
    view_list_inherit(instance);
};
