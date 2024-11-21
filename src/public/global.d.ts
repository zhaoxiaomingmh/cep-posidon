declare namespace JSX {
    interface IntrinsicElements {

        'sp-field-label': import('@spectrum-web-components/bundle').FieldLabel;
        'sp-field-group': import('@spectrum-web-components/bundle').FieldGroup;

        'sp-accordion': import('@spectrum-web-components/bundle').Accordion;
        'sp-accordion-item': import('@spectrum-web-components/bundle').AccordionItem;

        'sp-action-group': import('@spectrum-web-components/bundle').ActionGroup;
        'sp-action-button': import('@spectrum-web-components/bundle').ActionButton;
        'sp-button': import('@spectrum-web-components/bundle').Button;

        'sp-textfield': import('@spectrum-web-components/bundle').Textfield;
        'sp-textarea': any;

        'sp-slider': import('@spectrum-web-components/bundle').Slider;

        'sp-switch': import('@spectrum-web-components/bundle').Switch;

        'sp-dropdown': any;
        'sp-checkbox': any;
        'sp-picker': import('@spectrum-web-components/bundle').Picker | any;
        'sp-menu-divider': import('@spectrum-web-components/bundle').MenuDivider;
        'sp-menu': import('@spectrum-web-components/bundle').Menu | any;
        'sp-menu-group': import('@spectrum-web-components/bundle').MenuGroup | any;
        'sp-menu-item': import('@spectrum-web-components/bundle').MenuItem | any;

        'sp-dialog': import('@spectrum-web-components/bundle').Dialog;
        'sp-button-group': import('@spectrum-web-components/bundle').ButtonGroup;

        'sp-progressbar': import('@spectrum-web-components/bundle').ProgressBar;
        'sp-progress-circle': import('@spectrum-web-components/bundle').ProgressCircle;

        'sp-theme': import('@spectrum-web-components/bundle').Theme | any;

        'sp-link': import('@spectrum-web-components/bundle').Link | any;

        'sp-radio': any;
        'sp-radio-group': any;

        'sp-label': any;
        'sp-heading': any;
        'sp-body': any,
    }
}