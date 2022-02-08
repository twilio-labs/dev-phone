# Context-Based Sockets

## Context
Using websockets with Twilio requires a lot of state juggling in React, and that can lead to complex components that handle communication logic AND render logic.

## Decision
The app separates concerns by using a Context to hold all of the communication state and logic. Child components can access details from the Context, but the Context strives to only expose information that needs to be rendered and methods that the user needs to interact with. The child components should not handle any imperative logic about communications.

A general pattern to follow with Twilio web sockets is:

### The React Context
- Reflects the SDK docs. It contains the Device and other Objects, and therefore defines websocket event listeners and the implements relevant methods.
- It is allowed to update and access the Redux store as necessary
- It uses refs to hold some persistent details (like the single Voice Device and the device Details), but leverages the Effect hook for key side effects like redefining methods when an active call appears in the app. Meanwhile, local state holds communication objects that are dynamic - in the Voice case, this is the Call, which may or may not be present, but has various methods that are still important communication logic (like defining the hangup method, or a disconnect listener.)

### Redux
- Contains information that needs to be rendered. Information in Redux can be processed to be simpler for the lower-order-components to render (e.g., instead of storing an entire Call object, Redux can just hold relevant details, like whether it's inbound/outbound.)
- Redux's ONLY job is to know what the current state is as it relates to how the UI needs to render to the user.

### The UI Component
- Renders based on information in the Redux Store. For example, if there is an active call in the Voice SDK, it can change how various buttons are rendered in order to 
- It also uses the React context in order to expose key methods to the user - for example, the VoiceManager defines general usage of the sendDTMF SDK method, but the Caller Component actually calls that logic in the UI and allows a user to press '2' and send DTMF.

## Also considered
All of the websocket state could be pushed into Redux, but this would require either a higher-order component to hold communication logic (which involves a lot of explicit passing of props, making the code more tedious to maintain) or would dribble down to the same problem of a component that's defining communication logic. We want as much of our lower-order component logic as possible to be focused on rendering and user interaction.

## Consequences
This requires more in-depth knowledge of React. We're leaning heavily on what I would consider intermediate/advanced features, like multiple hooks (useRef, useState, useCallback, useEffect and their counterparts in Redux like useSelector). But working with the voice SDK is complex 🤷‍♂️ This architecture gives some structure to the complexity and creates some walls between different problems - once I know what I want to do, I know exactly where I should go to do it.