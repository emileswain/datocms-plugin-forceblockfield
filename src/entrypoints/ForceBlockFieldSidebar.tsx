import {RenderItemFormSidebarPanelCtx} from 'datocms-plugin-sdk';
import {Canvas} from 'datocms-react-ui';
import {Field} from 'datocms-plugin-sdk';

type PropTypes = {
    ctx: RenderItemFormSidebarPanelCtx;
};

export default function ForceBlockFieldSidebar({ctx}: PropTypes) {

    const modelFields = ctx.itemType.relationships.fields.data
        .map((link) => ctx.fields[link.id])
        .filter<Field>((x): x is Field => !!x);

    const textFields = modelFields.filter((field) => {
            //console.log(" == " + field.attributes.field_type);
            return ['text', 'string', 'rich_text'].includes(field.attributes.field_type);
        }
    );

    // const allText = textFields
    //     .map((field) => ctx.formValues[field.attributes.api_key])
    //     .join(' ');

    // const stats = readingTime(allText || ``);
    const stats = {words: 1, time: "1min"}


    return <Canvas ctx={ctx}>
        <ul>
            <li>Word count: {stats.words}</li>
            <li>Reading time: {stats.time}</li>
        </ul>
    </Canvas>;
}