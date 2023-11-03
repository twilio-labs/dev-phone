import {useLexicalComposerContext, CLEAR_EDITOR_COMMAND } from "@twilio-paste/core/lexical-library";
import { Button } from "@twilio-paste/core";
import {CustomizationProvider} from '@twilio-paste/core/customization';
import { SendIcon } from '@twilio-paste/icons/esm/SendIcon';

// Renders a send button for the Paste Chat Composer
function SendButtonPlugin({ onClick, canSendMessages }) {
  
    const [editor] = useLexicalComposerContext();
  
    const sendIt = (e) => {
      onClick(e);
      editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
    }
  
    return (
      <CustomizationProvider
        elements={{
          SMS_SEND_BUTTON: {
            float: 'right',
          },
        }}
      >
      <Button element="SMS_SEND_BUTTON" onClick={sendIt} type={"submit"} disabled={!canSendMessages}>
        <SendIcon decorative />
        Send
      </Button>
      </CustomizationProvider>
    )
  }

  export default SendButtonPlugin;