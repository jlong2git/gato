/**
     * External plugins added through the server-side FieldFactory are automatically registered.
     * Other external plugins (e.g. client-only) may still be registered here (and subsequently added via config.extraPlugins).
     *
     * e.g. if your plugin resides in src/main/resources/VAADIN/js:
     * CKEDITOR.plugins.addExternal("abbr", CKEDITOR.vaadinDirUrl + "js/abbr/");
     */
    CKEDITOR.editorConfig = function( config ) {

        //TODO: NEED TO LOAD IMAGE2 AND MAXIMIZE PLUGINS.  THE SUGGESTION ABOVE IS NOT HELPFUL.

         // MIRROR info.magnolia.ui.form.field.definition.RichTextFieldDefinition
         definition = {
                   alignment: true,
                   images: true,
                   lists: true,
                   source: true,
                   tables: true,
   
                   colors: "A78130,000000,666666,5E9201,993333,FFFFFF",
                   fonts: null,
                   fontSizes: null
           }
   
           // MIRROR info.magnolia.ui.form.field.factory.RichTextFieldFactory
           removePlugins = [];
   
           // CONFIGURATION FROM DEFINITION
   
          if (definition.colors != null) {
                   config.colorButton_colors = definition.colors;
                   config.colorButton_enableMore = true;
           } else {
                   removePlugins.push("colorbutton");
                   removePlugins.push("colordialog");
           }
           if (definition.fonts != null) {
                   config.font_names = definition.fonts;
           } else {
                   config.removeButtons = "Font";
           }
           if (definition.fontSizes != null) {
                   config.fontSize_sizes = definition.fontSizes;
           } else {
                   config.removeButtons = "FontSize";
           }
           if (definition.fonts == null && definition.fontSizes == null) {
               removePlugins.push("font");
                   removePlugins.push("fontSize");
           }

           //get templates
           //TODO: IT IS IGNORING THIS FILE OR CAN'T FIND IT AND GIVES NO ERROR.
           config.template_files = ['/.resources/gato-template/js/richeditor/templates.js'];

           //set allowed styles.  by default, there are many more styles to choose from
           config.stylesSet = [];
                config.stylesSet.push({ name: "Paragraph", element: "p"});
                config.stylesSet.push({ name: "Title", element: "h2"});
                config.stylesSet.push({ name: "Subtitle", element: "h3"});
                config.stylesSet.push({ name: "Subsubtitle", element: "h4"});
                config.stylesSet.push({ name: "Preformatted Text", element: "pre"});
                config.stylesSet.push({ name: "Superscript", element: "sup"});
                config.stylesSet.push({ name: "Subscript", element: "sub"});
                config.stylesSet.push({ name: "Strike Out", element: "s"});
                config.stylesSet.push({ name: 'Computer Code',  element: 'code' });
   
           // DEFAULT CONFIGURATION FROM FIELD FACTORY
           removePlugins.push("elementspath");
           removePlugins.push("filebrowser");
           config.removePlugins = removePlugins.join(",");
           config.extraPlugins = "magnolialink,magnoliaFileBrowser";
   
           config.width = 660;
           config.allowedContent = true;
           config.bodyClass = "txst-styledcontent txst-contentarea-paragraph";
           config.baseFloatZIndex = 150;
           config.resize_enabled = false;
           config.toolbar = "Magnolia";
           config.disableNativeSpellChecker = false;
           config.toolbar_Magnolia = [
                   { name: "basicstyles",   items: [ "Bold", "Italic", "Underline", "HorizontalRule", "Blockquote", "RemoveFormat", "SpecialChar" ] },
                   { name: "links",         items: [ "Link", "Unlink", "Anchor" ] },
                   { name: "clipboard",     items: [ "Copy", "Paste", "PasteText", "PasteFromWord" ] },
                   { name: "tables",        items: [ "Table" ] },
                   { name: "images",        items: ["Image", "Flash"]},
                   { name: "undo",          items: [ "Undo", "Redo" ] },
                   { name: "tools",         items: [ "Source" ] },
                   { name: "paragraph",     items: [ "JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyBlock", "NumberedList", "BulletedList","Indent", "Outdent"] },
                   { name: "templates",     items: [ "Templates" ]},
                   { name: "styles",        items: [ "Styles"]},
                   { name: "colors",        items: [ "TextColor" ] },
                   { name: "maximize",      items: [ "Maximize" ] }
           ];
           config.removeDialogTabs = 'image:advanced;link:advanced';
   };
