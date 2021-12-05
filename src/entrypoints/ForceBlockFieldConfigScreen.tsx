import {RenderManualFieldExtensionConfigScreenCtx} from "datocms-plugin-sdk";
import {Canvas, Form, SwitchField} from "datocms-react-ui";
import {useCallback, useEffect, useState} from "react";
import {ManualExtensionParameters} from "../types";

type PropTypes = {
    ctx: RenderManualFieldExtensionConfigScreenCtx;
};

export function ForceBlockFieldConfigScreen({ctx}: PropTypes) {

    const [pluginParameters, setPluginParameters] = useState<Partial<ManualExtensionParameters>>(ctx.parameters);
    const [blockSwitchFieldData, setBlockSwitchFieldData] = useState<any>([]);
    const parameters = ctx.parameters as ManualExtensionParameters;

    // const followerFields = useMemo(
    //     () =>
    //         parameters.slaveFields ? parameters.slaveFields.split(/\s*,\s*/) : [],
    //     [parameters]
    // );

    /**
     * update a single parameter field.
     */
    const update = useCallback(
        (field, value) => {
            const newParameters = {...pluginParameters, [field]: value};
            setPluginParameters(newParameters);
            ctx.setParameters(newParameters).then(() => {
            });
        },
        [pluginParameters, setPluginParameters, ctx]
    );

    /**
     * given the id for a block, check to see if its already been added to the plugin parameters.
     * @param blockTypeID
     */
    const blockFieldParameterContainsID = (blockTypeID: string): [boolean, number] => {
        let currentBlocksToApply: any[] = pluginParameters.blockFieldsArray as [];
        if (currentBlocksToApply === undefined) currentBlocksToApply = [];
        const hasValue = currentBlocksToApply?.indexOf(blockTypeID);
        //console.log(`blockFieldParameterContainsID:: blockTypeID : ${blockTypeID} forced: ${hasValue}`);
        return [hasValue !== -1, hasValue];
    }

    /**
     * Callback for <SwitchField>
     * if SwitchField is true, then add the blockID if it isn't already present.
     * If SwitchField is false, remove the blockID if it's present.
     * Update parameters.
     */
    const updateBlockFields = useCallback(
        (blockID, switchFieldValue) => {

            let currentBlocksToApply: any[] = pluginParameters.blockFieldsArray as [];
            if (currentBlocksToApply === undefined) currentBlocksToApply = [];

            const [hasValue, blockIndex] = blockFieldParameterContainsID(blockID);
            if (switchFieldValue === true) {
                // add the block
                if (!hasValue) {
                    currentBlocksToApply.push(blockID);
                }
            } else {
                // remove the block
                if (hasValue) {
                    currentBlocksToApply.splice(blockIndex, 1);
                }
            }

            const field = "blockFieldsArray";
            const newParameters = {...pluginParameters, [field]: currentBlocksToApply || []};
            setPluginParameters(newParameters);
            ctx.setParameters(newParameters).then(() => {
            });
        },
        [pluginParameters, setPluginParameters, ctx]
    );


    /**
     * The Addon Plugin unfortunately doesn't know which field your editing, or have access
     * to its properties, such as validators. The ctx object has all the information, but you
     * cannot pull the specific data for the field you are currently editing.
     *
     * So instead of just listing the validators (aka the blocks) for this field, we have to display
     * all of the blocks for the model.
     *
     * This function, builds the data used to render multiple SwitchFields representing the blocks a user
     * can force apply to this field when creating a new model.
     *
     * Steps.
     * 1. build list of validators.
     * 2. create a list of switchField data for each validator.
     * 2.1 set the state of the switchfield based on if the blockID is in the parameters.blockFieldsArray
     * (blockFieldsArray is a property of the blockField Plugin)
     */
    useEffect(() => {

        let validators: string[] = [];
        Object.values(ctx.fields).forEach((field: any) => {
            //// rich_text_blocks is the field type for modula blocks.
            if (field.attributes.validators.hasOwnProperty("rich_text_blocks"))
                if (field.attributes.validators.rich_text_blocks.hasOwnProperty("item_types"))
                    validators = validators.concat(field.attributes.validators.rich_text_blocks["item_types"]);
        });


        let initialSwitchFieldData: any[] = [];
        validators.forEach((validators_block_id, index) => {
            const blockDetails = Object.values(ctx.itemTypes).find((entry) => entry!["id"] === validators_block_id);
            const blockName = blockDetails!.attributes.name;
            initialSwitchFieldData.push({
                force: blockFieldParameterContainsID(validators_block_id)[0],
                validators_block_id: validators_block_id,
                blockName: blockName,
                key: `${index}-${validators_block_id}`
            });
        })
        setBlockSwitchFieldData(initialSwitchFieldData);

        //// Goal: Find the validators for this field.
        // Object.values(ctx.fields).find(
        //     (entry) => entry["itemTypeId"] === itemTypeId
        // );

        //// Attempt to cheat crossdomain denied.
        // const settings:any = window.parent.document.getElementsByClassName("Tabs__extra-info");///Field ID: 7544431
        // console.log("Addon == " + JSON.stringify(settings, null, 3));
    }, [parameters]);

    return (
        <Canvas ctx={ctx}>
            <Form>
                {/*<TextField*/}
                {/*    id="targetFields"*/}
                {/*    name="targetFields"*/}
                {/*    label="blockFields in this model, that should be automatically filled."*/}
                {/*    hint="Please insert the block fields API key separated by commas"*/}
                {/*    required*/}
                {/*    value={pluginParameters.blockFields}*/}
                {/*    onChange={update.bind(null, "blockFields")}*/}
                {/*/>*/}
                <SwitchField
                    id="devMode"
                    name="devMode"
                    label="Enable DebugMode"
                    value={pluginParameters.devMode || false}
                    onChange={update.bind(null, "devMode")}
                />
                <div>Select blocks to automatically apply to this field, when creating a new instance of this model.
                </div>
                {blockSwitchFieldData.map((detail: any) => (
                    <SwitchField
                        key={detail.key}
                        id={`${detail.validators_block_id}`}
                        name={`${detail.validators_block_id}`}
                        label={`Force apply ${detail.blockName}`}
                        value={detail.force}
                        onChange={updateBlockFields.bind(null, detail.validators_block_id)}
                    />
                ))}

            </Form>
        </Canvas>
    );
}


//const blockValidators = ctx.parameters.validators.rich_text_blocks["item_types"];
// const blockFields = useMemo(
//     () =>
//         parameters.blockFields ? parameters.blockFields.split(/\s*,\s*/) : [],
//     [parameters]
// );

//// To immediately save a parameter, use callback, otherwise, you have
//// to click save manually.
// const update = useCallback(
//     (field, value) => {
//         const newParameters = { ...formValues, [field]: value };
//         setFormValues(newParameters);
//         ctx.setParameters(newParameters);
//     },
//     [formValues, setFormValues, ctx]
// );