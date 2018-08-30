class Compile {
    constructor(el, vm) {
        this.$vm = vm;
        this.$el = el;

        if(this.$el) {
            this.$fragment = this.node2Fragment(this.$el);
            this.init();
            this.$el.appendChild(this.$fragment);
        }
    }

    node2Fragment (el) {
        let fragment = document.createDocumentFragment(),child;
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    }

    init () {
        this.compileElement(this.$fragment);
    }
    compileElement (el) {
        let childNodes = el.childNodes;
        let me = this;

        // [].slice.call(childNodes) 将类数组转换成数组
        [].slice.call(childNodes).forEach(element => {
            const text = node.textContent;
            const reg = /\{\{(.*)\}\}/;

            if (me.isELementNode(element)) {
                me.compile(node);
            } else if (me.isTextNode(element) && reg.test(text)) {
                me.compileText(node, RegExp.$1);
            }

            if(node.childNodes && node.childNodes.length) {
                me.compileElement(node);
            }
        });
    }

    compile (node) {
        const nodeAttrs = node.attributes, me = this;
        [].slice.call(nodeAttrs).forEach(function(attr) {
            let attrName = attr.name;
            if(me.isDirective(attrName)) {
                let exp = attr.value;
                let dir = attrName.subString(2);
                if (me.isEventDirective(dir)) {
                    compileUtil.eventHandler(node, me.$vm, exp, dir);
                } else {
                    compileUtil[dir] && compileUtil[dir](node, me.$vm, exp);
                }

                node.removeAttribute(attrName);
            }
        });
    }

    compileText (node, exp) {
        compileUtil.text(node, this.$vm, exp);
    }
    isDirective (attr) {
        return attr.indexOf('v-') === 0;
    }

    isEventDirective (node) {
        return node.nodeType === 1;
    }

    isELementNode (node) {
        return node.nodeType === 1;
    }

    isTextNode (node) {
        return node.nodeType === 3;
    }
};

const compileUtil = {
    text (node,vm, exp) {
        this.bind(node, vm, exp, 'text');
    },

    html (node, vm, exp) {
        this.bind(node, vm, exp, 'html');
    },

    model (node, vm, exp) {
        this.bind(node, vm, exp, 'model');
        let me = this,val = this._getVMVal(vm, exp);

        node.addEventListener('input', function(e) {
            var newValue = e.target.value;
            if(val === newValue) {
                return;
            }

            me._setVMVal(vm, exp, newValue);
            val = newValue;
        })
    },

    class (node, vm, exp) {
        this.bind(node, vm, exp, 'class');
    },

    bind (node, vm, exp, dir) {
        let updateFn = updater[dir + 'Updater'];

        updaterFn && updateFn(node, this._getVMVal(vm, exp));

        new Watcher(vm, exp, (value, oldValue) => {
            updateFn && updateFn(node, value, oldValue);
        })
    },

    eventHandler (node, vm, exp, dir) {
        let eventType = dir.split(':')[1];
        let fn = vm.$options.methods && vm.$options.methods[exp];

        if(eventType && fn) {
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },

    _getVMVal (vm, exp) {
        let val = vm;
        let exp = exp.split('.');
        exp.forEach((k) => {
            val = val[k];
        });

        return val;
    },

    _setVMVal (vm, exp, value) {
        let val = vm;
        let exp = exp.split('.');
        exp.forEach((k,i) => {
            i < exp.length -1 ? val = val[k] : val[k] = value;
        });
    }
}

let updater = {
    textUpdater (node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value;
    },

    htmlUpdater (node, value) {
        node.innerHTML = typeof value === 'undefined' ? '' : value;
    },

    classUpdater(node, value, oldValue) {
        const className = node.className;
        className = className.replace(oldValue, '').replace(/\s$/, '');
        
        const space = className && String(value) ? ' ' : '';

        node.className = className + space + value;
    },

    modelUpdater (node, value, oldValue) {
        node.value = typeof value === 'undefined' ? '' : value;
    }

}