import {RenderFieldExtensionCtx} from 'datocms-plugin-sdk';
import {Canvas} from 'datocms-react-ui';
import {ManualExtensionParameters} from "../types";
import get from "lodash/get";
import {useCallback} from "react";
import {nanoid} from 'nanoid'

type Props = {
    ctx: RenderFieldExtensionCtx;
};

export function ForceBlockFieldExtension({ctx}: Props) {
    const parameters = ctx.parameters as ManualExtensionParameters;


   const forceApplyBlocks = useCallback(
        async () => {
            const quickLog = (val: any) => {
                if (parameters.devMode) console.log(val)
            }

            quickLog("Field API_KEY: " + ctx.field.attributes.api_key);

            //// Get the validators, as this defines the blocks we want this field to be able to
            //// attach.
            ////
            // @ts-ignore
            const blockValidators = ctx.field.attributes.validators.rich_text_blocks["item_types"];
            quickLog("blockTypes  " + JSON.stringify(blockValidators, null, 3));

            ////
            //// If we don't have any blockValidators in the validation field then leave.
            ////
            if (blockValidators.length === 0) return;

            ////
            //// Get the value of this field, which should be an array.
            //// This was determined through observation, couldn't find any documentation
            //// on how to actually do this or what to expect.
            ////
            const fieldValue = get(ctx.formValues, ctx.field.attributes.api_key) as [];
            quickLog(" fieldValue == " + JSON.stringify(fieldValue, null, 3))
            quickLog(" ctx.formValues == " + JSON.stringify(ctx.formValues, null, 3))
            ////
            //// For each Block type listed in the validation
            //// force add that item.
            ////
            blockValidators.forEach((itemTypeId: string) => {
                // console.log("itemTypeId: " + itemTypeId);

                const blocksToApply = parameters.blockFieldsArray || [];


                const forceApplyBlock = blocksToApply?.indexOf(itemTypeId) >= 0;
                quickLog(`blocksToApply =${JSON.stringify(blocksToApply, null, 2)} \r\n Force Apply Block : ${forceApplyBlock}`);

                if (forceApplyBlock) {
                    //// check to see if we have an entry for the block
                    //// if there is no entry, then lets add it.
                    const hasEntry = Object.values(fieldValue).find(
                        (entry) => entry["itemTypeId"] === itemTypeId
                    );
                    if (!hasEntry) {
                        //// this is the magic. setting the field value with the itemTypeID, essentially
                        //// triggers the required rebuild and displays the correct form.
                        //// itemID is required to save the record without failure. Just made one up.
                        ////
                        try{
                            ctx.setFieldValue(ctx.field.attributes.api_key, [...fieldValue || [], {
                                "itemTypeId": itemTypeId,
                                "itemId": "new-" + nanoid(),
                            }]);
                        }catch(error) {
                            console.error(`ForceBlocks setFieldValue Failed; \r\n ${JSON.stringify(error, null, 2)}`);
                        }
                    }
                }
            });
        },
        [ctx, ctx.field.attributes.localized]
    );
    forceApplyBlocks().then(() => {});

    return (
        <Canvas ctx={ctx}>
            <div/>
        </Canvas>
    );
}