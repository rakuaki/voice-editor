JSONEditor.defaults.options.disable_properties = true;
JSONEditor.defaults.options.disable_array_reorder = true;
JSONEditor.defaults.options.theme = 'bootstrap4';

JSONEditor.defaults.language = "zh";
JSONEditor.defaults.languages.zh = {
    button_collapse: "折叠",
    button_expand: "展开",
    button_add_row_title: "添加 {{0}}",
    button_delete_last_title: "删除上一个 {{0}}",
    button_delete_row_title: "删除",
    error_uniqueItems: "分类名和声音名不得留空或相同",
    button_delete_node_warning: "确定要删除吗？",
};

const defaultSchema = {
    'title': 'Root',
    'type': 'object',
    'required': [
        'voices',
    ],
    'properties': {
        'voices': {
            'type': 'array',
            'format': 'tabs',
            'title': 'Voices',
            'uniqueItems': true,
            'items': {
                'type': 'object',
                'title': '分类',
                'required': [
                    'categoryName',
                    'categoryDescription',
                    'voiceList',
                ],
                'properties': {
                    'categoryName': {
                        'type': 'string',
                        'title': '分类名',
                    },
                    'categoryDescription': {
                        'type': 'object',
                        'title': '分类描述',
                        'description': '',
                        'properties': {
                            'zh-CN': {
                                'type': 'string',
                                'default': ''
                            },
                            'ja-JP': {
                                'type': 'string',
                                'default': ''
                            },
                            'en-US': {
                                'type': 'string',
                                'default': ''
                            }
                        },
                        'required': [
                            'zh-CN',
                            'ja-JP',
                            'en-US'
                        ],
                    },
                    'voiceList': {
                        'type': 'array',
                        'format': 'tabs',
                        'title': '声音列表',
                        'uniqueItems': false,
                        'items': {
                            'type': 'object',
                            'title': '声音',
                            'required': [
                                'name',
                                'path',
                                'description',
                            ],
                            'properties': {
                                'name': {
                                    'type': 'string',
                                    'title': '声音名',
                                },
                                'path': {
                                    'type': 'string',
                                    'title': '声音路径',
                                },
                                'description': {
                                    'type': 'object',
                                    'title': '声音描述',
                                    'description': '',
                                    'properties': {
                                        'zh-CN': {
                                            'type': 'string',
                                            'default': ''
                                        },
                                        'ja-JP': {
                                            'type': 'string',
                                            'default': ''
                                        },
                                        'en-US': {
                                            'type': 'string',
                                            'default': ''
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

let data = {}

let defaultOptions = {
    object_layout: 'normal',
    schema: defaultSchema,
    show_errors: 'interaction'
}

let jsoneditor = null


const head = document.getElementsByTagName('head')[0]
const jsonEditorForm = document.querySelector('#json-editor-form')
const outputTextarea = document.querySelector('#output-textarea')
const setValue = document.querySelector('#setvalue')
const validateTextarea = document.querySelector('#validate-textarea')

const parseUrl = () => {
    const url = window.location.search
    const queryParamsString = url.substring(1, url.length)
    const queryParams = queryParamsString.split('&')

    if (queryParamsString.length) {
        queryParams.forEach((queryParam) => {
            const splittedParam = queryParam.split('=')
            const param = splittedParam[0]
            const value = splittedParam[1]

            if (param === 'data') {
                try {
                    data = JSON.parse(LZString.decompressFromBase64(value))
                } catch (reason) {
                }
            }
        })
    }

    mergeOptions()
}

const mergeOptions = () => {
    data.options = Object.assign(defaultOptions, data.options)
    refreshUI()
}

const refreshUI = () => {
    if (data.selectedLibs || data.unselectedLibs) {
        data.unselectedLibs.forEach((selectedLib) => {
            const concat = libMapping[selectedLib].js.concat(libMapping[selectedLib].css)
            concat.forEach(() => {
                const className = '.external_' + selectedLib
                const toRemove = head.querySelector(className)
                if (toRemove) {
                    toRemove.parentNode.removeChild(toRemove)
                }
            })
        })

        data.selectedLibs.forEach((selectedLib) => {
            libMapping[selectedLib].js.forEach((js) => {
                let scriptElement = document.createElement('script')
                scriptElement.type = 'text/javascript'
                scriptElement.src = js
                scriptElement.async = false
                scriptElement.classList.add('external_' + selectedLib)
                head.appendChild(scriptElement)
            })
            libMapping[selectedLib].css.forEach((css) => {
                const linkElement = document.createElement('link')
                linkElement.setAttribute('rel', 'stylesheet')
                linkElement.setAttribute('type', 'text/css')
                linkElement.setAttribute('href', css)
                linkElement.classList.add('external_' + selectedLib)
                head.appendChild(linkElement)
            })
        })
    }

    initJsoneditor()
}

const initJsoneditor = () => {
    if (jsoneditor) {
        jsoneditor.destroy()
    }

    jsoneditor = new window.JSONEditor(jsonEditorForm, data.options)

    jsoneditor.on('change', function () {
        let json = jsoneditor.getValue()
        outputTextarea.value = JSON.stringify(json, null, 2)

        let validationErrors = jsoneditor.validate()
        if (validationErrors.length) {
            validateTextarea.value = JSON.stringify(validationErrors, null, 2)
        } else {
            validateTextarea.value = '校验成功！'
        }
    })
}

setValue.addEventListener('click', function () {
    jsoneditor.setValue(JSON.parse(outputTextarea.value))
})

parseUrl()