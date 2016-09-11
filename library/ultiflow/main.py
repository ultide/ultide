import os
import os.path
import json

def get_workspace(session_data):
    workspace = session_data['user'].get_property('workspace')
    if (workspace is None):
        workspace = 'workspaces' + os.path.sep + str(session_data['user'].id)
        session_data['user'].set_property('workspace', workspace)
        
    return workspace


def get_operators_infos(path):
    items = os.listdir(path)
    operators_tree = {}
    operators_list = {}
    for item in items:
        item_path = path + os.path.sep + item
        if (os.path.isdir(item_path)):
            config_path = item_path + os.path.sep + 'config.json'
            if (os.path.isfile(config_path)):
                config = None
                try:
                    with open(config_path, 'r') as f:
                        config = json.load(f)
                    config['path'] = config_path
                    operator_id = config['id']
                    operators_tree[operator_id] = True
                    operators_list[operator_id] = config
                except:
                    pass # todo
            else:
                inside_operators_tree, inside_operators_list = get_operators_infos(item_path)
                operators_tree[item] = inside_operators_tree
                operators_list.update(inside_operators_list)
    return operators_tree, operators_list

def update_operators_infos(directory, name, operators_path, operators_list, operators_tree):
    if (os.path.isdir(operators_path)):
        module_operators_tree, module_operators_list = get_operators_infos(operators_path)
        operators_list.update(module_operators_list)
        operators_tree[directory][name] = module_operators_tree

def on_modules_infos(data, response, session_data):
    operators_list = {}
    operators_tree = {'library': {}, 'workspace': {}}
    for module_name in session_data['modules_infos']:
        module_infos = session_data['modules_infos'][module_name]
        if 'config' in module_infos:
            name = module_infos['config'].name
            operators_path = module_infos['path'] + os.path.sep + 'operators'
            update_operators_infos('library', name, operators_path, operators_list, operators_tree)
    workspace = get_workspace(session_data)
    for dir_name in os.listdir(workspace):
        name = dir_name
        operators_path = workspace + os.path.sep + dir_name + os.path.sep + 'operators'
        update_operators_infos('workspace', name, operators_path, operators_list, operators_tree)
    response['operators'] = {'list': operators_list, 'tree': operators_tree}