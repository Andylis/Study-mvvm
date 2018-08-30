class Observer {
    constructor(data) {
        this.data = data;
        this.walk(data);
    }

    walk (data) {
        const me = this;
        Object.keys(data).forEach(function(key) {
            // me.convert(key, data[key]);
            me.definReactive(me.data, key, data[key]);
        });
    }

    // convert (key, val) {
    //     this.definReactive(this.data, key, val);
    // }
    
    definReactive (data, key, val) {
        let dep = new Dep();
        let childObj = observe(val);
        
        Object.defineProperty(data, key, {
            enumerable: true,
            get () {
                if(Dep.target) {
                    dep.depend();
                }
                return val;
            },
            set (newVal) {
                if(newVal === val) {
                    return;
                }
                val = newVal;
                childObj = observe(newVal);
                dep.notify();
            }
        })
    }
}

// 如果属性值为对象，对其属性值也要进行监听
function observe (val, vm) {
    debugger
    if(!val || typeof val !=='object') {
        return;
    }

    return new Observer(val);
}

let uid = 0;//记录监听器Dep数量

class Dep {
    constructor () {
        this.id = uid++;
        this.subs = [];
    }

    addSub (sub) {
        this.subs.push(sub);
    }

    depend () {
        Dep.target.addDep(this);
    }

    removeSub () {
        const index = this.subs.indexOf(sub);
        if (index !== -1) {
            this.subs.splice(index,1);
        }
    }

    notify () {
        this.subs.forEach(function(sub) {
            sub.update();
        })
    }
};

Dep.target = null;