import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";


const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
}
export const SocketProvider = ({ children }) => {
    const socket = useRef();
    const { userInfo} = useAppStore();
    useEffect(() => {
        if (userInfo) {
            console.log("Connecting to WebSocket at:", HOST);
            socket.current = io(HOST, {
                withCredentials: true,
                query: { userId: userInfo.id },
            });
            socket.current.on("connect", () => {
                console.log("Connected to socket server")
            });

            const handleRecieveMessage= (message)=>{
                const {selectedChatData,selectedChatType,addMessage, addContactsInDMContacts}=useAppStore.getState();
                console.log("Received message:", message);
                console.log("Selected Chat Data:", selectedChatData);
                console.log("Selected Chat Type:", selectedChatType);
                if(selectedChatType!==undefined&&
                    (selectedChatData._id === message.sender._id||
                        selectedChatData._id===message.recipient._id)
                ){
                    console.log("message rcv",message);
                    addMessage(message);
                }
                addContactsInDMContacts(message);
                
            };
            const handleRecieveChannelMessage=(message)=>{
                const {selectedChatData,selectedChatType,addMessage,addChannelInChannelList}=useAppStore.getState();
                if(selectedChatType!==undefined&&selectedChatData._id===message.channelId){
                    addMessage(message);
                }
                addChannelInChannelList(message);
            }
            socket.current.on("recieveMessage",handleRecieveMessage);
            socket.current.on("recieve-channel-message",handleRecieveChannelMessage);
            return () => {
                socket.current.disconnect();
            };
        }
    }, [userInfo]);
    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>

    )

}


// import { HOST } from "@/utils/constants";
// import { useAppStore } from "@/store";
// import { createContext, useContext, useEffect, useRef } from "react";
// import { io } from "socket.io-client";

// const SocketContext = createContext(null);

// export const useSocket = () => {
//   return useContext(SocketContext);
// };

// export const SocketProvider = ({ children }) => {
//   const socket = useRef();
//   const { userInfo } = useAppStore();

//   useEffect(() => {
//     if (userInfo) {
//       socket.current = io(HOST, {
//         withCredentials: true,
//         query: { userId: userInfo.id },
//       });
//       socket.current.on("connect", () => {
//         console.log("Connected to socket server");
//       });

//       const handleReceiveMessage = (message) => {
//         // Access the latest state values
//         const {
//           selectedChatData: currentChatData,
//           selectedChatType: currentChatType,
//           addMessage,
//           addContactInDMContacts,
//         } = useAppStore.getState();

//         if (
//           currentChatType !== undefined &&
//           (currentChatData._id === message.sender._id ||
//             currentChatData._id === message.recipient._id)
//         ) {
//           addMessage(message);
//         }
//         addContactInDMContacts(message);
//       };

//       const handleReceiveChannelMessage = (message) => {
//         const {
//           selectedChatData,
//           selectedChatType,
//           addMessage,
//           addChannelInChannelLists,
//         } = useAppStore.getState();

//         if (
//           selectedChatType !== undefined &&
//           selectedChatData._id === message.channelId
//         ) {
//           addMessage(message);
//         }
//         addChannelInChannelLists(message);
//       };

//       const addNewChannel = (channel) => {
//         const { addChannel } = useAppStore.getState();
//         addChannel(channel);
//       };

//       socket.current.on("receiveMessage", handleReceiveMessage);
//       socket.current.on("recieve-channel-message", handleReceiveChannelMessage);
//       socket.current.on("new-channel-added", addNewChannel);

//       return () => {
//         socket.current.disconnect();
//       };
//     }
//   }, [userInfo]);

//   return (
//     <SocketContext.Provider value={socket.current}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export default SocketProvider;