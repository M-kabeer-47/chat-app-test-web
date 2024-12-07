"use client"
import { createContext, useCallback, useEffect,useState } from "react"
import{ io,Socket } from "socket.io-client"
interface SocketProviderProps {
    children: React.ReactNode
}
export interface ISocketContext {
    sendMessage: (message: string) => any
}
export const SocketContext = createContext<ISocketContext | null>(null)

export default function SocketProvider({children}: SocketProviderProps) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const sendMessage = useCallback((message:string)=>{
        console.log("Message sent", message);
        if(socket){
          socket.emit("event:message",{
            message
          })
        }
    
     },[socket])
    useEffect(() => {   
        const socket = io("https://chat-app-test-pydh.onrender.com")
        setSocket(socket)
        return () => { socket.disconnect() }
    }
    ,[])


    return (
        <SocketContext.Provider value={{sendMessage}}>
            {children}
        </SocketContext.Provider>
    )       

}    