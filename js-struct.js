// This library was modified to support Big Endian values

/* 
 * js-struct.js - Utility to assist in parsing c-style structs from an ArrayBuffer
 */
/*
 * Copyright (c) 2011 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *	1. The origin of this software must not be misrepresented; you must not
 *	claim that you wrote the original software. If you use this software
 *	in a product, an acknowledgment in the product documentation would be
 *	appreciated but is not required.
 *
 *	2. Altered source versions must be plainly marked as such, and must not
 *	be misrepresented as being the original software.
 *
 *	3. This notice may not be removed or altered from any source
 *	distribution.
 */

"use strict";

// TODO: Ugh, this is messy. Do it differentely soon, please!
var nextStructId = 0;

var Struct = Object.create(Object, {
	/**
	* Defines a single byte integer value (byte/char). 
	* @param name Property name
	*/
	int8: { 
		value: function(name, endian) { 
			return { name: name, readCode: "v.getInt8(o"+(endian?',true':'')+");", byteLength: 1, defaultValue: 0, structProperty: true }; 
		}
	},
	
	/**
	* Defines an unsigned single byte integer value (ubyte/uchar). 
	* @param name Property name
	*/
	uint8: { 
		value: function(name, endian) { 
			return { name: name, readCode: "v.getUint8(o"+(endian?',true':'')+");", byteLength: 1, defaultValue: 0, structProperty: true };
		}
	},
	
	/**
	* Defines a two byte integer value (short). 
	* @param name Property name
	*/
	int16: { 
		value: function(name, endian) { 
			return { name: name, readCode: "v.getInt16(o"+(endian?',true':'')+");", byteLength: 2, defaultValue: 0, structProperty: true };
		}
	},
	
	/**
	* Defines an unsigned two byte integer value (ushort). 
	* @param name Property name
	*/
	uint16: { 
		value: function(name, endian) { 
			return { name: name, readCode: "v.getUint16(o"+(endian?',true':'')+");", byteLength: 2, defaultValue: 0, structProperty: true };
		}
	},
	
	/**
	* Defines a four byte integer value (int/long). 
	* @param name Property name
	*/
	int32: { 
		value: function(name, endian) { 
			return { name: name, readCode: "v.getInt32(o"+(endian?',true':'')+");", byteLength: 4, defaultValue: 0, structProperty: true };
		}
	},
	
	/**
	* Defines an unsigned four byte integer value (uint/ulong). 
	* @param name Property name
	*/
	uint32: { 
		value: function(name, endian) { 
			return { name: name, readCode: "v.getUint32(o"+(endian?',true':'')+");", byteLength: 4, defaultValue: 0, structProperty: true };
		}
	},
	
	/**
	* Defines a four byte floating point value (float). 
	* @param name Property name
	*/
	float32: { 
		value: function(name, endian) { 
			return { name: name, readCode: "v.getFloat32(o"+(endian?',true':'')+");", byteLength: 4, defaultValue: 0, structProperty: true };
		}
	},
	
	/**
	* Defines an eight byte floating point value (double). 
	* @param name Property name
	*/
	float64: { 
		value: function(name, endian) { 
			return { name: name, readCode: "v.getFloat64(o"+(endian?',true':'')+");", byteLength: 8, defaultValue: 0, structProperty: true };
		}
	},


	
	/**
	* Defines a fixed-length ASCII string. 
	* Will always read the number of characters specified, but the returned string will truncate at the first null char.
	* @param name Property name
	* @param length Number of characters to read
	*/
	string: {
		value: function(name, length) {
			var code = "(function(o) {\n";
			code += "   var str = \"\";\n";
			code += "   for(var j = 0; j < " + length + "; ++j) {\n";
			code += "	   var char = v.getUint8(o+j, true);\n";
			code += "	   if(char === 0) { break; }\n";
			code += "	   str += String.fromCharCode(char);\n";
			code += "   }\n";
			code += "   return str;\n";
			code += "})(o);\n";
			return {
				name: name,
				readCode: code, 
				byteLength: length, 
				defaultValue: "",
				structProperty: true
			};
		}
	},
	
	/**
	* Defines a fixed-length array of structs or primitives
	* @param name Property name
	* @param type struct or primitive type to read
	* @param length Number of elements to read. Total bytes read will be type.byteLength * length
	*/
	array: {
		value: function(name, type, length) {
			var code = "(function(o) {\n";
			code += "   var aa = new Array(" + length + "), av;\n";
			code += "   for(var j = 0; j < " + length + "; ++j) {\n";
			code += "	   av = " + type.readCode + "\n";
			code += "	   o += " + type.byteLength + ";\n";
			code += "	   aa[j] = av;\n";
			code += "   }\n";
			code += "   return aa;\n"
			code += "})(o);\n";
			return {
				name: name,
				readCode: code, 
				byteLength: type.byteLength * length, 
				defaultValue: null,
				array: true,
				structProperty: true
			};
		}
	},
	
	/**
	* Defines a nested struct
	* @param name Property name
	* @param struct Struct to read
	*/
	struct: {
		value: function(name, struct) {
			return {
				name: name,
				readCode: struct.readCode, 
				byteLength: struct.byteLength, 
				defaultValue: null,
				struct: true,
				structProperty: true
			};
		}
	},
	
	/**
	* Defines a number of the bytes to be skipped over.
	* @param length Number of bytes to be skipped
	*/
	skip: {
		value: function(length) {
			return {
				name: null,
				readCode: "null;\n", 
				byteLength: length,
				structProperty: true
			};
		}
	},
	
	/**
	* Compiles the code to read a struct from the struct's definition
	* @param structDef Object sequentially defining the binary types to read
	* @param prototype Optional, additional prototypes to apply to the returned struct object
	* @returns An object containing a "readStructs" function that can read an array of the defined type from an ArrayBuffer
	*/
	create: {
		value: function(/* collected via arguments */) {
			var type;
			var properties = arguments[arguments.length-1].structProperty ? {} : arguments[arguments.length-1];
			
			var byteLength = 0;
			var struct = Object.create(Object.prototype, properties);
			
			// This new struct will be assigned a unique name so that instances can be easily constructed later.
			// It is not recommended that you use these names for anything outside this class, as they are not
			// intended to be stable from run to run.
			Object.defineProperty(struct, "struct_type_id", { value: "struct_id_" + nextStructId, enumerable: false, configurable: false, writable: false });
			Object.defineProperty(this, struct.struct_type_id, { value: struct, enumerable: false, configurable: false, writable: false });
			nextStructId += 1;
			
			// Build the code to read a single struct, calculate byte lengths, and define struct properties
			var readCode = "(function(o) { var st = Object.create(Struct." + struct.struct_type_id + ");\n";
			for(var i = 0; i < arguments.length; ++i) {
				type = arguments[i];
				if(!type.structProperty) { continue; }
				if(type.name) {
					Object.defineProperty(struct, type.name, { value: type.defaultValue, enumerable: true, configurable: true, writable: true });
					readCode += "st." + type.name + " = " + type.readCode + "\n";
				}
				readCode += "o += " + type.byteLength + ";\n";
				byteLength += type.byteLength;
			}
			readCode += "return st; })(o);";
			
			// Build the code to read an array of this struct type
			var parseScript = "var a = new Array(count);\n var s;\n";
			parseScript += "var v = new DataView(arrayBuffer, offset);\n"; // TODO: I should be able to specify a length here (count * this.byteLength), but it consistently gives me an INDEX_SIZE_ERR. Wonder why?
			parseScript += "var o = 0, so = 0;\n";
			parseScript += "for(var i = 0; i < count; ++i) {\n";
			parseScript += "	so = o;\n";
			parseScript += "	s = " + readCode + "\n";
			parseScript += "	o += this.byteLength;\n";
			parseScript += "	if(callback) { callback(s, offset+so); }\n";
			parseScript += "	a[i] = s;\n";
			parseScript += "}\n";
			parseScript += "return a;\n";
			
			Object.defineProperty(struct, "byteLength", { value: byteLength, enumerable: true, configurable: true, writable: true });
			Object.defineProperty(struct, "readCode", { value: readCode, enumerable: true, configurable: true, writable: true });
			
			var parseFunc = new Function("arrayBuffer", "offset", "count", "callback", parseScript);
			Object.defineProperty(struct, "readStructs", { value: parseFunc, configurable: true, writable: true });
			
			return struct;
		}
	},
});

Struct.BIG_ENDIAN = false;
Struct.LITTLE_ENDIAN = true;
