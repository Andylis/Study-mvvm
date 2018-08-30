class MVVM {
    constructor(options) {
        this.$option = options || {};
        const data = this._data = this.$option.data;
        const me = this;

        //@description 实现vm.xxx = vm._data.xxx
        Object.keys(data).forEach(function(key) {
            me._proxyData(key);
        });

        this._initComputed();
        oberve(data, this);

        this.$compile = new Compile(options.el || document.body, this);
    }
    
    $watch(key, cb, options) {
        new Watcher(this, key, cb);
    }
    
    _proxyData(key, setter, getter) {
        const me = this;
        /*
        * @function Object.defineProperty(obj, key, descriptor)
        * @param {Object} me - 赋值对象
        * @param {String} key - 属性名称
        * @param {Object} descriptor - 属性描述   
        * @description descriptor 
        * - 分为两种(数据描述和存取描述)，二选其一
        * 共有属性： {
        *   configurable: false,
        *   enumberable: false
        * }
        * 数据描述特有属性: {
        *   value: '',
        *   writable: false
        * }
        * @example 
        *   Object.defineProperty(o, "a", {
                value : 37,
                writable : true,
                enumerable : true,
                configurable : true
            });
        * 存取描述特有属性： {
        *   get() {},
        *   set() {}
        * }
        *  @example 
        *   Object.defineProperty(o, "b", {
                get : function(){
                    return bValue;
                },
                set : function(newValue){
                    bValue = newValue;
                },
                enumerable : true,
                configurable : true
            });
        */
        // 通过Object.defineProperty 给每个属性绑定get 和 set函数
        setter = setter || Object.defineProperty(me, key, {
            configurable: false,
            enumerable: true,
            get() {
                return me._data[key];
            },
            set(newVal) {
                me._data[key] = newVal;
            }
        });
    }
    _initComputed () {
        const me = this;
        const computed = this.$option.computed;
        if (typeof computed === 'object') {
            Object.keys(computed).forEach(function(key){
                Object.defineProperty(me, key, {
                    get: () =>  typeof computed[key] === 'function' ? computed[key] : computed[key].get
                })
            })
        }
    }
}
 export default MVVM;