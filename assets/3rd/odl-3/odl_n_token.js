(function() {
    'use strict';

    let odl = (typeof exports === 'object' && typeof global === 'object') ? global.odl : window.odl;

    odl.OpToken = {
        kind: 'op.token',

        /**
         *
         */
        _oTokens: [
            {
                odc: '-',
                add: [
                    {
                        odc: 'odcName',
                        action: 'add',
                        from: {user: '', ip: '', dt: new Date()},
                        token: {
                            state: 'ing',
                            id: 'xxx',
                            duration: 'ms',
                            deadline: 'datetime',
                        }
                    }],
                edit: [],
                del: []
            },
        ],

        getSimilar: function(odc) {
            return odl.findNObj(odc, this.kind);
        },

        getSimilarByName: function(name) {
            let odc = odl.findOdc(name);
            return odc ? this.getSimilar(odc) : null;
        },

        findTokenLogById: function(id) {
            this._oTokens.forEach(ot => {
                if (ot.add.find(t => t.token.id === id)) {
                    return t;
                }
                if (ot.edit.find(t => t.token.id === id)) {
                    return t;
                }
                if (ot.del.find(t => t.token.id === id)) {
                    return t;
                }
            });
            return null;
        },

        /**
         *
         * @param from
         * @param odc
         * @param action
         * @returns {string|tl.token|{duration, state, id, deadline}}
         */
        reqToken: function(from, odc, action) {
            let ot = this._oTokens.find(x => x.odc === odc.metadata.name);
            if (!ot) {
                ot = {
                    odc: odc.metadata.name,
                    add: [],
                    edit: [],
                    del: [],
                };
                this._oTokens.push(ot);
            }
            let tls = ot[action];
            if (!tls) return ['request token - odc[',odc,'], action[',action,'] : is invalid!'].join('');
            // if (tls.length > 0) return ['request token - odc[',odc,'], action[',action,'] : There is already an action in progress!'].join('');
            if (tls.length > 100) { ot[action] = []; tls = ot[action] };
            let tl = {
                odc: odc.metadata.name,
                action: action,
                from: from,
                token: {
                    state: 'ing',
                    id: 'xxx',
                    duration: 30 * 60 * 1000,
                    deadline: new Date(Date.now() + 30 * 60 * 1000),
                }
            };
            tls.push(tl);
            return tl.token;
        },

        releaseToken: function(odc, action) {
            let ot = this._oTokens.find(x => x.odc === odc.metadata.name);
            if (!ot) return;
            let tls = ot[action];
            if (!tls) return;
            ot[action] = [];
        }
    };
    odl.registerNPlugin(odl.OpToken);
})();
