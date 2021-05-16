// Type definitions for mongoose-unique-validator
// This definition is a modified version
// of the definition in:
// @types/mongoose-unique-validator 1.0.4
// Project: https://github.com/blakehaswell/mongoose-unique-validator#readme
// Definitions by: Steve Hipwell <https://github.com/stevehipwell>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// Minimum TypeScript Version: 3.2

declare module 'mongoose-unique-validator' {

    import { Schema } from "mongoose";
    export = mongooseUniqueValidator;

    function mongooseUniqueValidator(schema: Schema, options?: any): void;

    namespace mongooseUniqueValidator {
    }
}
