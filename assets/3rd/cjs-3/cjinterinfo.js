/**
 * Created by oudream on 2016/12/8.
 */
(function() {
    'use strict';

    if (typeof exports === 'object' && typeof global === 'object') {
        global.cjs = global.cjs || {};
    } else if (typeof window === 'object') {
        window.cjs = window.cjs || {};
        if (!window.setImmediate) {
            window.setImmediate = function(func, args) {
                return window.setTimeout(func, 0, args);
            };
            window.clearImmediate = window.clearTimeout;
        }
    } else {
        throw Error('cjs only run at node.js or web browser');
    }
    let CjInterinfo = cjs.CjInterinfo || {};
    cjs.CjInterinfo = CjInterinfo;
    if (typeof exports === 'object' && typeof global === 'object') {
        exports = module.exports = CjInterinfo;
    }

    if (CjInterinfo.hasOwnProperty('debug')) return;

    CjInterinfo.LevelNone = 0x00000000;
    CjInterinfo.LevelFatal = 0x00010000;
    CjInterinfo.LevelError = 0x00020000;
    CjInterinfo.LevelWarn = 0x00040000;
    CjInterinfo.LevelInfo = 0x00080000;
    CjInterinfo.LevelDebug = 0x00100000;

    CjInterinfo._defaultModule = '';
    CjInterinfo.setDefaultModule = function(sModule) {
        CjInterinfo._defaultModule = sModule;
    };

    CjInterinfo._defaultLevel = CjInterinfo.LevelDebug;
    CjInterinfo.setDefaultLevel = function(iLevel) {
        CjInterinfo._defaultLevel = iLevel;
    };

    function CjOutInfoParam() {
        this.module = CjInterinfo._defaultModule;
        this.level = CjInterinfo._defaultLevel;
        this.title = '';
        this.time = Date.now();
        this.source = '';
        this.target = '';
        this.tags = [];
    }

    function CjOutputI() {
        this.infoParam = new CjOutInfoParam();

        this.getInfoParamString = function() {
            return JSON.stringify(this.infoParam);
        };

        this.output = function() {
        };
    }

    function CjInputI() {
        this.input = function() {
        };
    }

  // array of CjOutputI
    CjInterinfo._outputs = [];
    CjInterinfo.registerOutput = function(OutPutI) {
        let outputs = CjInterinfo._outputs;
        if (!outputs.includes(OutPutI)) {
            CjInterinfo._outputs.push(OutPutI);
        }
    };

    CjInterinfo.debug = function() {
        for (let i = 0; i < CjInterinfo._outputs.length; i++) {
            let OutPutI = CjInterinfo._outputs[i];
            let output = new OutPutI();
            output.infoParam.level = CjInterinfo.LevelDebug;
            output.output(...arguments);
        }
    };

    CjInterinfo.info = function() {
        for (let i = 0; i < CjInterinfo._outputs.length; i++) {
            let OutPutI = CjInterinfo._outputs[i];
            let output = new OutPutI();
            output.infoParam.level = CjInterinfo.LevelInfo;
            output.output(...arguments);
        }
    };

    CjInterinfo.warn = function() {
        for (let i = 0; i < CjInterinfo._outputs.length; i++) {
            let OutPutI = CjInterinfo._outputs[i];
            let output = new OutPutI();
            output.infoParam.level = CjInterinfo.LevelWarn;
            output.output(...arguments);
        }
    };

    CjInterinfo.error = function() {
        for (let i = 0; i < CjInterinfo._outputs.length; i++) {
            let OutPutI = CjInterinfo._outputs[i];
            let output = new OutPutI();
            output.infoParam.level = CjInterinfo.LevelError;
            output.output(...arguments);
        }
    };

  // console out
    function CjOutputConsole() {
        CjOutputI.call(this);

        let self = this;

        this.output = function() {
            switch (self.level) {
            case CjInterinfo.LevelInfo:
                // console.info(self.getInfoParamString());
                console.info.apply(null, arguments);
                break;
            case CjInterinfo.LevelWarn:
                // console.info(self.getInfoParamString());
                console.warn.apply(null, arguments);
                break;
            case CjInterinfo.LevelError:
                // console.info(self.getInfoParamString());
                console.error.apply(null, arguments);
                break;
            default:
                // console.info(self.getInfoParamString());
                console.log.apply(null, arguments);
                break;
            }
        };
    }

    function CjModule(sModule) {
        this.module = sModule;
    }

    CjModule.prototype.debug = function() {
        for (let i = 0; i < CjInterinfo._outputs.length; i++) {
            let OutPutI = CjInterinfo._outputs[i];
            let output = new OutPutI();
            output.infoParam.module = this.module;
            output.infoParam.level = CjInterinfo.LevelDebug;
            output.output(...arguments);
        }
    };

    CjModule.prototype.info = function() {
        for (let i = 0; i < CjInterinfo._outputs.length; i++) {
            let OutPutI = CjInterinfo._outputs[i];
            let output = new OutPutI();
            output.infoParam.module = this.module;
            output.infoParam.level = CjInterinfo.LevelInfo;
            output.output(...arguments);
        }
    };

    CjModule.prototype.warn = function() {
        for (let i = 0; i < CjInterinfo._outputs.length; i++) {
            let OutPutI = CjInterinfo._outputs[i];
            let output = new OutPutI();
            output.infoParam.module = this.module;
            output.infoParam.level = CjInterinfo.LevelWarn;
            output.output(...arguments);
        }
    };

    CjModule.prototype.error = function() {
        for (let i = 0; i < CjInterinfo._outputs.length; i++) {
            let OutPutI = CjInterinfo._outputs[i];
            let output = new OutPutI();
            output.infoParam.module = this.module;
            output.infoParam.level = CjInterinfo.LevelError;
            output.output(...arguments);
        }
    };

    CjInterinfo.Module = CjModule;

    CjInterinfo._modules = [];

    CjInterinfo.findModule = function(sModule) {
        for (let i = 0; i < CjInterinfo._modules.length; i++) {
            let module = CjInterinfo._modules[i];
            if (module.module === sModule) {
                return module;
            }
        }
        return null;
    };

  // _registerRegisterModules = mult function
    CjInterinfo._registerRegisterModules = [];
    CjInterinfo.registerRegisterModule = function(fn) {
        if (!CjInterinfo._registerRegisterModules.includes(fn)) {
            CjInterinfo._registerRegisterModules.push(fn);
        }
    };

    CjInterinfo.registerModule = function(sModule) {
        if (typeof sModule !== 'string' && !(sModule instanceof String)) {
            return false;
        }
        if (CjInterinfo.findModule(sModule) === null) {
            let module = new CjModule(sModule);
            CjInterinfo._modules.push(module);
            cjs[sModule] = module;
        }
        for (let i = 0; i < CjInterinfo._registerRegisterModules.length; i++) {
            let registerRegisterModule = CjInterinfo._registerRegisterModules[i];
            registerRegisterModule(sModule);
        }
    };

    CjInterinfo.registerOutput(CjOutputConsole);

    CjInterinfo.OutInfoParam = CjOutInfoParam;
    CjInterinfo.OutPutI = CjOutputI;
    CjInterinfo.InPutI = CjInputI;

    cjs.debug = CjInterinfo.debug;
    cjs.info = CjInterinfo.info;
    cjs.warn = CjInterinfo.warn;
    cjs.error = CjInterinfo.error;
})();
