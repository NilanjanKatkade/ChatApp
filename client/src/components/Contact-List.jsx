import { useAppStore } from '@/store'
import { Avatar, AvatarImage } from './ui/avatar';
import { HOST } from '@/utils/constants';
import { getColor } from '@/lib/utils';

const ContactList = ({ contacts, isChanel = false }) => {
    const { selectedChatData, setSelectedChatData, setSelectedChatType, setSelectedChatMessages, } = useAppStore();
    const uniqueContacts = Array.from(new Map(contacts.map(contact => [contact._id, contact])).values());
    const handleClick = (contact) => {
        if (isChanel) setSelectedChatType("channel");
        else setSelectedChatType("contact");
        setSelectedChatData(contact);
        if (selectedChatData && selectedChatData._id !== contact._id) {
            setSelectedChatMessages([]);
        }
    }
    return (
        <div className='mt-5'>
            {uniqueContacts.map((contact) => (
                <div key={`${contact._id}-${isChanel ? 'channel' : 'contact'}`} className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${selectedChatData && (selectedChatData._id === contact._id) ? "bg-[#8417ff]" : "hover:bg-[#f1f1f111]"}`}
                    onClick={() => handleClick(contact)}>
                    <div className='flex gap-5 items-center justify-start text-neutral-300'>
                        {
                            !isChanel && (
                                <Avatar className="w-10 h-10 rounded-full overflow-hidden">
                                    {contact.image ? (
                                        <AvatarImage
                                            src={`${HOST}/${contact.image}`}
                                            alt="profile"
                                            className="object-cover w-full h-full bg-black rounded-full"
                                        />
                                    ) : (
                                        <div
                                            className={`
                                                ${selectedChatData&&selectedChatData._id===contact._id?"bg-[ffffff22] boder border-white/70":getColor(contact.color)}
                                                uppercase w-10 h-10 text-lg   border-[1px] flex items-center justify-center rounded-full`}
                                        >
                                            {contact.firstName
                                                ? contact.firstName.split("").shift()
                                                : contact.email.split("").shift()}
                                        </div>
                                    )}
                                </Avatar>
                            )}
                            {
                                isChanel && <div className='bg-[#ffffff22] h-10 w-10 flex items-center justify-center'>#</div>
                            }
                            {
                                isChanel ? <span>{contact.name}</span>:<span>{contact.firstName?`${contact.firstName} ${contact.lastName}`:contact.email}</span>
                            }
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ContactList



