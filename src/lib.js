"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lx = void 0;
/**
 * Base class for all lexicon items with .json and .infer properties.
 */
var BaseLexiconItem = /** @class */ (function () {
    function BaseLexiconItem() {
    }
    Object.defineProperty(BaseLexiconItem.prototype, "infer", {
        get: function () {
            return {};
        },
        enumerable: false,
        configurable: true
    });
    return BaseLexiconItem;
}());
/**
 * Null type class.
 */
var LxNull = /** @class */ (function (_super) {
    __extends(LxNull, _super);
    function LxNull(options) {
        var _this = _super.call(this) || this;
        _this.json = __assign({ type: "null" }, options);
        return _this;
    }
    return LxNull;
}(BaseLexiconItem));
/**
 * Boolean type class.
 */
var LxBoolean = /** @class */ (function (_super) {
    __extends(LxBoolean, _super);
    function LxBoolean(options) {
        var _this = _super.call(this) || this;
        _this.json = __assign({ type: "boolean" }, options);
        return _this;
    }
    return LxBoolean;
}(BaseLexiconItem));
/**
 * Integer type class.
 */
var LxInteger = /** @class */ (function (_super) {
    __extends(LxInteger, _super);
    function LxInteger(options) {
        var _this = _super.call(this) || this;
        _this.json = __assign({ type: "integer" }, options);
        return _this;
    }
    return LxInteger;
}(BaseLexiconItem));
/**
 * String type class.
 */
var LxString = /** @class */ (function (_super) {
    __extends(LxString, _super);
    function LxString(options) {
        var _this = _super.call(this) || this;
        _this.json = __assign({ type: "string" }, options);
        return _this;
    }
    return LxString;
}(BaseLexiconItem));
/**
 * Unknown type class.
 */
var LxUnknown = /** @class */ (function (_super) {
    __extends(LxUnknown, _super);
    function LxUnknown(options) {
        var _this = _super.call(this) || this;
        _this.json = __assign({ type: "unknown" }, options);
        return _this;
    }
    return LxUnknown;
}(BaseLexiconItem));
/**
 * Bytes type class.
 */
var LxBytes = /** @class */ (function (_super) {
    __extends(LxBytes, _super);
    function LxBytes(options) {
        var _this = _super.call(this) || this;
        _this.json = __assign({ type: "bytes" }, options);
        return _this;
    }
    return LxBytes;
}(BaseLexiconItem));
/**
 * CID Link type class.
 */
var LxCidLink = /** @class */ (function (_super) {
    __extends(LxCidLink, _super);
    function LxCidLink(link) {
        var _this = _super.call(this) || this;
        _this.json = { type: "cid-link", $link: link };
        return _this;
    }
    return LxCidLink;
}(BaseLexiconItem));
/**
 * Blob type class.
 */
var LxBlob = /** @class */ (function (_super) {
    __extends(LxBlob, _super);
    function LxBlob(options) {
        var _this = _super.call(this) || this;
        _this.json = __assign({ type: "blob" }, options);
        return _this;
    }
    return LxBlob;
}(BaseLexiconItem));
/**
 * Array type class.
 */
var LxArray = /** @class */ (function (_super) {
    __extends(LxArray, _super);
    function LxArray(items, options) {
        var _a;
        var _this = _super.call(this) || this;
        // Serialize items using .json if available
        var serializedItems = (_a = items === null || items === void 0 ? void 0 : items.json) !== null && _a !== void 0 ? _a : items;
        _this.json = __assign({ type: "array", items: serializedItems }, options);
        return _this;
    }
    return LxArray;
}(BaseLexiconItem));
/**
 * Object type class.
 */
var LxObject = /** @class */ (function (_super) {
    __extends(LxObject, _super);
    function LxObject(properties) {
        var _this = _super.call(this) || this;
        // Extract required and nullable fields
        var required = Object.keys(properties).filter(function (key) {
            var _a, _b;
            var value = properties[key];
            return (_b = (_a = value === null || value === void 0 ? void 0 : value.json) === null || _a === void 0 ? void 0 : _a.required) !== null && _b !== void 0 ? _b : value === null || value === void 0 ? void 0 : value.required;
        });
        var nullable = Object.keys(properties).filter(function (key) {
            var _a, _b;
            var value = properties[key];
            return (_b = (_a = value === null || value === void 0 ? void 0 : value.json) === null || _a === void 0 ? void 0 : _a.nullable) !== null && _b !== void 0 ? _b : value === null || value === void 0 ? void 0 : value.nullable;
        });
        // Serialize properties using .json if available
        var serializedProps = Object.fromEntries(Object.entries(properties).map(function (_a) {
            var _b;
            var key = _a[0], value = _a[1];
            return [
                key,
                (_b = value === null || value === void 0 ? void 0 : value.json) !== null && _b !== void 0 ? _b : value,
            ];
        }));
        var result = {
            type: "object",
            properties: serializedProps,
        };
        if (required.length > 0) {
            result.required = required;
        }
        if (nullable.length > 0) {
            result.nullable = nullable;
        }
        _this.json = result;
        return _this;
    }
    return LxObject;
}(BaseLexiconItem));
/**
 * Params type class.
 */
var LxParams = /** @class */ (function (_super) {
    __extends(LxParams, _super);
    function LxParams(properties) {
        var _this = _super.call(this) || this;
        // Extract required fields
        var required = Object.keys(properties).filter(function (key) {
            var _a, _b;
            var value = properties[key];
            return (_b = (_a = value === null || value === void 0 ? void 0 : value.json) === null || _a === void 0 ? void 0 : _a.required) !== null && _b !== void 0 ? _b : value === null || value === void 0 ? void 0 : value.required;
        });
        // Serialize properties using .json if available
        var serializedProps = Object.fromEntries(Object.entries(properties).map(function (_a) {
            var _b;
            var key = _a[0], value = _a[1];
            return [
                key,
                (_b = value === null || value === void 0 ? void 0 : value.json) !== null && _b !== void 0 ? _b : value,
            ];
        }));
        var result = {
            type: "params",
            properties: serializedProps,
        };
        if (required.length > 0) {
            result.required = required;
        }
        _this.json = result;
        return _this;
    }
    return LxParams;
}(BaseLexiconItem));
/**
 * Token type class.
 */
var LxToken = /** @class */ (function (_super) {
    __extends(LxToken, _super);
    function LxToken(description) {
        var _this = _super.call(this) || this;
        _this.json = { type: "token", description: description };
        return _this;
    }
    return LxToken;
}(BaseLexiconItem));
/**
 * Ref type class.
 */
var LxRef = /** @class */ (function (_super) {
    __extends(LxRef, _super);
    function LxRef(ref, options) {
        var _this = _super.call(this) || this;
        _this.json = __assign({ type: "ref", ref: ref }, options);
        return _this;
    }
    return LxRef;
}(BaseLexiconItem));
/**
 * Union type class.
 */
var LxUnion = /** @class */ (function (_super) {
    __extends(LxUnion, _super);
    function LxUnion(refs, options) {
        var _this = _super.call(this) || this;
        _this.json = __assign({ type: "union", refs: refs }, options);
        return _this;
    }
    return LxUnion;
}(BaseLexiconItem));
/**
 * Record type class.
 */
var LxRecord = /** @class */ (function (_super) {
    __extends(LxRecord, _super);
    function LxRecord(options) {
        var _a, _b;
        var _this = _super.call(this) || this;
        // Serialize the record property if it's a class instance
        var serializedOptions = __assign(__assign({}, options), { record: (_b = (_a = options.record) === null || _a === void 0 ? void 0 : _a.json) !== null && _b !== void 0 ? _b : options.record });
        _this.json = __assign({ type: "record" }, serializedOptions);
        return _this;
    }
    return LxRecord;
}(BaseLexiconItem));
/**
 * Query type class.
 */
var LxQuery = /** @class */ (function (_super) {
    __extends(LxQuery, _super);
    function LxQuery(options) {
        var _a, _b, _c, _d;
        var _this = _super.call(this) || this;
        // Serialize nested params and output if they have .json
        var serializedOptions = options
            ? __assign(__assign({}, options), { parameters: (_b = (_a = options.parameters) === null || _a === void 0 ? void 0 : _a.json) !== null && _b !== void 0 ? _b : options.parameters, output: options.output
                    ? __assign(__assign({}, options.output), { schema: (_d = (_c = options.output.schema) === null || _c === void 0 ? void 0 : _c.json) !== null && _d !== void 0 ? _d : options.output.schema }) : undefined }) : {};
        _this.json = __assign({ type: "query" }, serializedOptions);
        return _this;
    }
    return LxQuery;
}(BaseLexiconItem));
/**
 * Procedure type class.
 */
var LxProcedure = /** @class */ (function (_super) {
    __extends(LxProcedure, _super);
    function LxProcedure(options) {
        var _a, _b, _c, _d, _e, _f;
        var _this = _super.call(this) || this;
        // Serialize nested params, input, and output if they have .json
        var serializedOptions = options
            ? __assign(__assign({}, options), { parameters: (_b = (_a = options.parameters) === null || _a === void 0 ? void 0 : _a.json) !== null && _b !== void 0 ? _b : options.parameters, input: options.input
                    ? __assign(__assign({}, options.input), { schema: (_d = (_c = options.input.schema) === null || _c === void 0 ? void 0 : _c.json) !== null && _d !== void 0 ? _d : options.input.schema }) : undefined, output: options.output
                    ? __assign(__assign({}, options.output), { schema: (_f = (_e = options.output.schema) === null || _e === void 0 ? void 0 : _e.json) !== null && _f !== void 0 ? _f : options.output.schema }) : undefined }) : {};
        _this.json = __assign({ type: "procedure" }, serializedOptions);
        return _this;
    }
    return LxProcedure;
}(BaseLexiconItem));
/**
 * Subscription type class.
 */
var LxSubscription = /** @class */ (function (_super) {
    __extends(LxSubscription, _super);
    function LxSubscription(options) {
        var _a, _b, _c, _d;
        var _this = _super.call(this) || this;
        // Serialize nested params and message if they have .json
        var serializedOptions = options
            ? __assign(__assign({}, options), { parameters: (_b = (_a = options.parameters) === null || _a === void 0 ? void 0 : _a.json) !== null && _b !== void 0 ? _b : options.parameters, message: options.message
                    ? __assign(__assign({}, options.message), { schema: (_d = (_c = options.message.schema) === null || _c === void 0 ? void 0 : _c.json) !== null && _d !== void 0 ? _d : options.message.schema }) : undefined }) : {};
        _this.json = __assign({ type: "subscription" }, serializedOptions);
        return _this;
    }
    return LxSubscription;
}(BaseLexiconItem));
var Namespace = /** @class */ (function () {
    function Namespace(id, defs) {
        this.id = id;
        this.defs = defs;
        // Serialize defs if they contain class instances
        var serializedDefs = Object.fromEntries(Object.entries(defs).map(function (_a) {
            var _b;
            var key = _a[0], value = _a[1];
            return [
                key,
                (_b = value === null || value === void 0 ? void 0 : value.json) !== null && _b !== void 0 ? _b : value,
            ];
        }));
        this.json = {
            lexicon: 1,
            id: id,
            defs: serializedDefs,
        };
    }
    Object.defineProperty(Namespace.prototype, "infer", {
        get: function () {
            // TODO this could return the runtime inferred type if we need it
            return {};
        },
        enumerable: false,
        configurable: true
    });
    return Namespace;
}());
/**
 * Main API for creating lexicon schemas.
 * @see https://atproto.com/specs/lexicon
 */
exports.lx = {
    /**
     * Creates a null type.
     * @see https://atproto.com/specs/lexicon#null
     */
    null: function (options) {
        return new LxNull(options);
    },
    /**
     * Creates a boolean type with optional constraints.
     * @see https://atproto.com/specs/lexicon#boolean
     */
    boolean: function (options) {
        return new LxBoolean(options);
    },
    /**
     * Creates an integer type with optional min/max and enum constraints.
     * @see https://atproto.com/specs/lexicon#integer
     */
    integer: function (options) {
        return new LxInteger(options);
    },
    /**
     * Creates a string type with optional format, length, and value constraints.
     * @see https://atproto.com/specs/lexicon#string
     */
    string: function (options) {
        return new LxString(options);
    },
    /**
     * Creates an unknown type for flexible, unvalidated objects.
     * @see https://atproto.com/specs/lexicon#unknown
     */
    unknown: function (options) {
        return new LxUnknown(options);
    },
    /**
     * Creates a bytes type for arbitrary byte arrays.
     * @see https://atproto.com/specs/lexicon#bytes
     */
    bytes: function (options) {
        return new LxBytes(options);
    },
    /**
     * Creates a CID link reference to content-addressed data.
     * @see https://atproto.com/specs/lexicon#cid-link
     */
    cidLink: function (link) {
        return new LxCidLink(link);
    },
    /**
     * Creates a blob type for binary data with MIME type constraints.
     * @see https://atproto.com/specs/lexicon#blob
     */
    blob: function (options) {
        return new LxBlob(options);
    },
    /**
     * Creates an array type with item schema and length constraints.
     * @see https://atproto.com/specs/lexicon#array
     */
    array: function (items, options) {
        return new LxArray(items, options);
    },
    /**
     * Creates a token type for symbolic values in unions.
     * @see https://atproto.com/specs/lexicon#token
     */
    token: function (description) {
        return new LxToken(description);
    },
    /**
     * Creates a reference to another schema definition.
     * @see https://atproto.com/specs/lexicon#ref
     */
    ref: function (ref, options) {
        return new LxRef(ref, options);
    },
    /**
     * Creates a union type for multiple possible type variants.
     * @see https://atproto.com/specs/lexicon#union
     */
    union: function (refs, options) {
        return new LxUnion(refs, options);
    },
    /**
     * Creates a record type for repository records.
     * @see https://atproto.com/specs/lexicon#record
     */
    record: function (options) {
        return new LxRecord(options);
    },
    /**
     * Creates an object type with defined properties.
     * @see https://atproto.com/specs/lexicon#object
     */
    object: function (properties) {
        return new LxObject(properties);
    },
    /**
     * Creates a params type for query string parameters.
     * @see https://atproto.com/specs/lexicon#params
     */
    params: function (properties) {
        return new LxParams(properties);
    },
    /**
     * Creates a query endpoint definition (HTTP GET).
     * @see https://atproto.com/specs/lexicon#query
     */
    query: function (options) {
        return new LxQuery(options);
    },
    /**
     * Creates a procedure endpoint definition (HTTP POST).
     * @see https://atproto.com/specs/lexicon#procedure
     */
    procedure: function (options) {
        return new LxProcedure(options);
    },
    /**
     * Creates a subscription endpoint definition (WebSocket).
     * @see https://atproto.com/specs/lexicon#subscription
     */
    subscription: function (options) {
        return new LxSubscription(options);
    },
    /**
     * Creates a lexicon namespace document.
     * @see https://atproto.com/specs/lexicon#lexicon-document
     */
    namespace: function (id, defs) {
        return new Namespace(id, defs);
    },
};
