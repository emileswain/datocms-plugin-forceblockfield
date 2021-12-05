import {connect, IntentCtx, RenderManualFieldExtensionConfigScreenCtx} from 'datocms-plugin-sdk';
import {render} from './utils/render';
import ConfigScreen from './entrypoints/ConfigScreen';
import 'datocms-react-ui/styles.css';
// import SidebarBlockField from "./entrypoints/SidebarBlockField";
import {ForceBlockFieldExtension} from "./entrypoints/ForceBlockFieldExtension";
import {ForceBlockFieldConfigScreen} from "./entrypoints/ForceBlockFieldConfigScreen";

// const allowedFieldTypes = ["boolean"] as NonNullable<PluginAttributes["field_types"]>;


connect({
    renderConfigScreen(ctx) {
        return render(<ConfigScreen ctx={ctx}/>);
    },

    itemFormSidebarPanels() {
        return [
            {
                id: 'forceBlockField',
                label: 'Force Block Field'
            }
        ];
    },
    // renderItemFormSidebarPanel(sidebarPaneID, ctx) {
    //     render(<SidebarBlockField ctx={ctx}/>);
    // },

    manualFieldExtensions(ctx: IntentCtx) {
        return [
            {
                id: 'forceBlockField',
                name: 'Force Block Field',
                type: 'addon',
                fieldTypes: ['rich_text'],
                configurable: true,
            },
        ];
    },
    renderFieldExtension(id, ctx) {
        render(<ForceBlockFieldExtension ctx={ctx}/>);
    },
    renderManualFieldExtensionConfigScreen(
        fieldExtensionId: string,
        ctx: RenderManualFieldExtensionConfigScreenCtx
    ) {
        render(<ForceBlockFieldConfigScreen ctx={ctx}/>);
    },
}).then(() => {
});
