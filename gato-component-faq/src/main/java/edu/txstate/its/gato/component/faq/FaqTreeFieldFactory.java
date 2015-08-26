package edu.txstate.its.gato.component.faq;

import com.vaadin.data.Item;
import com.vaadin.ui.Field;
import com.vaadin.ui.Tree;

import info.magnolia.ui.form.field.definition.FieldDefinition;
import info.magnolia.ui.form.field.factory.AbstractFieldFactory;

public class FaqTreeFieldFactory<D extends FieldDefinition> extends AbstractFieldFactory<FaqTreeFieldDefinition, Object> {

    public FaqTreeFieldFactory(FaqTreeFieldDefinition definition,
            Item relatedFieldItem) {
        super(definition, relatedFieldItem);
        // TODO Auto-generated constructor stub
    }

    @Override
    protected Field<Object> createFieldComponent() {
        // TODO Auto-generated method stub
        Tree tree = new Tree("Test empty tree");

        return tree;
    }

}
