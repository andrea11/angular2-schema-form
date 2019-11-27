import { FormProperty, PropertyGroup } from './formproperty';
import { FormPropertyFactory } from './formpropertyfactory';
import { PROPERTY_TYPE_MAPPING } from './typemapping';
import { SchemaValidatorFactory } from '../schemavalidatorfactory';
import { ValidatorRegistry } from './validatorregistry';
import { ExpressionCompilerFactory } from '../expression-compiler-factory';

export class ArrayProperty extends PropertyGroup {

  constructor(private formPropertyFactory: FormPropertyFactory,
              schemaValidatorFactory: SchemaValidatorFactory,
              validatorRegistry: ValidatorRegistry,
              expressionCompilerFactory: ExpressionCompilerFactory,
              schema: any,
              parent: PropertyGroup,
              path: string) {
    super(schemaValidatorFactory, validatorRegistry, expressionCompilerFactory, schema, parent, path);
  }

  addItem(value: any = null): FormProperty {
    const newProperty = this.addProperty();
    newProperty.reset(value, false);
    return newProperty;
  }

  private addProperty() {
    const newProperty = this.formPropertyFactory.createProperty(this.schema.items, this);
    (<FormProperty[]>this.properties).push(newProperty);
    return newProperty;
  }

  removeItem(item: FormProperty) {
    this.properties = (<FormProperty[]>this.properties).filter(i => i !== item);
    this.updateValueAndValidity(false, true);
  }

  setValue(value: any, onlySelf: boolean) {
    this.createProperties();
    this.resetProperties(value);
    this.updateValueAndValidity(onlySelf, true);
  }

  public _hasValue(): boolean {
    return true;
  }

  public _updateValue() {
    this.reduceValue();
  }

  private reduceValue(): void {
    const value = [];
    this.forEachChild((property, _) => {
      if (property.visible && property._hasValue()) {
        value.push(property.value);
      }
    });
    this._value = value;
  }

  reset(value: any, onlySelf = true) {
    value = value || this.schema.default || [];
    this.properties = [];
    this.resetProperties(value);
    this.updateValueAndValidity(onlySelf, true);
  }

  private createProperties() {
    this.properties = [];
  }


  private resetProperties(value: any) {
    for (const idx in value) {
      if (value.hasOwnProperty(idx)) {
        const property = this.addProperty();
        property.reset(value[idx], true);
      }
    }
  }
}

PROPERTY_TYPE_MAPPING.array = (
    schemaValidatorFactory: SchemaValidatorFactory,
    validatorRegistry: ValidatorRegistry,
    expressionCompilerFactory: ExpressionCompilerFactory,
    schema: any,
    parent: PropertyGroup,
    path: string,
    formPropertyFactory: FormPropertyFactory,
) => {
    return new ArrayProperty(
        formPropertyFactory, schemaValidatorFactory, validatorRegistry, expressionCompilerFactory, schema, parent, path);
};
