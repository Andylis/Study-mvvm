class Warcher {
    constructor (vm, expOrfn, cb) {
        this.vm = vm;
        this.expOrfn = expOrfn;
        this.cd = cb;
        this.depIds = {};

        if(typeof expOrfn === 'function') {
            this.getter = expOrfn;
        } else {
            this.getter = this.parseGetter(expOrfn);
        }

        this.value = this.get();
    }

    update () {
        this.run();
    }

    run () {
        const value = this.get();
        const oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal);
        }
    }

    addDep (dep) {
        if(this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    }

    get () {
        Dep.target = this;
        const value = this.getter.call(this.vm, this.vm);
        Dep.target = null;
        return value;
    }

    parseGetter (exp) {
        if(/[^\w.$]/.test(exp)) return;
        const exps = exp.split('.');
        
        return (obj) => {
            exps.forEach((element, index) => {
                if(!obj) return;
                obj = obj[exps[index]];   
            });
            return obj;
        }
    }
}