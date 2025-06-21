import { type SchemaTypeDefinition } from "sanity";
import { categoryType } from "./categoryType";
import { blockContentType } from "./blockContentType";
import { productType } from "./productType";
import { orderType } from "./orderType";
import { brandType } from "./brandTypes";
import { authorType } from "./authorType";
import { addressType } from "./addressType";
import { userType } from "./userType"; // Make sure to import userType

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Core content types
    productType,
    categoryType,
    brandType,
    
    // User-related types
    userType,      
    addressType,    // References userType
    
    // Supporting types
    blockContentType,
    orderType,
    authorType,
    
  ],
};