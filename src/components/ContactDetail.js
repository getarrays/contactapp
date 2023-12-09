import { Link, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from 'react';
import { getContact } from '../api/ContactService';
import { toastError } from "../api/ToastService";

const ContactDetail = ({updateContact, updateImage}) => {
    const [contact, setContact] = useState({
        address: '',
        email: '',
        id: '',
        name: '',
        phone: '',
        photoUrl: '',
        status: '',
        title: ''
    });
    const inputRef = useRef();
    const { id } = useParams();

    const getcontact = async (id) => {
        try {
            const { data } = await getContact(id);
            setContact({...data, photoUrl: `${data.photoUrl}?time=${new Date().getTime()}`});
            console.log(data);
        } catch (error) {
            console.log(error.message);
            toastError(error.message);
         }
    };

    const selectImage = () => {
        inputRef.current.click();
    };

    const updatePhoto = async (file) => {
        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('id', id);
        await updateImage(formData);
        contact.photoUrl = `${contact.photoUrl}&updated_at=${new Date().getTime()}`
        setContact((prev) => ({ photoUrl: `${prev.photoUrl}`, ...prev}));
        console.log(contact);
    };

    const onChange = (event) => {
        setContact({ ...contact, [event.target.name]: event.target.value })
    }

    const onUpdateContact = async (event) => {
        event.preventDefault();
        updateContact(contact);
    };

    useEffect(() => {
        getcontact(id);
    }, [])

    return (
        <>
            <Link to={'/'} className="link"><i className="bi bi-arrow-left"></i> Back to list</Link>
            {contact &&
                <div className="profile">
                    <div className="profile__details">
                        <img src={contact.photoUrl} alt={`Profile photo of ${contact.name}`} />
                        <div className="profile__metadata">
                            <p className="profile__name">{contact.name}</p>
                            <p className="profile__muted">JPG, GIF or PNG. Max size of 10MG</p>
                            <button onClick={selectImage} className="btn"><i className="bi bi-cloud-upload"></i> Change Photo</button>
                        </div>
                    </div>
                    <div className="profile__settings">
                        <div>
                            <form onSubmit={onUpdateContact} className="form">
                                <div className="user-details">
                                    <input type="hidden" defaultValue={contact.id} name="id" required />
                                    <div className="input-box">
                                        <span className="details">Name</span>
                                        <input onChange={onChange} type="text" value={contact.name} name="name" required />
                                    </div>
                                    <div className="input-box">
                                        <span className="details">Email</span>
                                        <input onChange={onChange} type="text" value={contact.email} name="email" required />
                                    </div>
                                    <div className="input-box">
                                        <span className="details">Phone</span>
                                        <input onChange={onChange} type="text" value={contact.phone} name="phone" required />
                                    </div>
                                    <div className="input-box">
                                        <span className="details">Address</span>
                                        <input onChange={onChange} type="text" value={contact.address} name="address" required />
                                    </div>
                                    <div className="input-box">
                                        <span className="details">Title</span>
                                        <input onChange={onChange} type="text" value={contact.title} name="title" required />
                                    </div>
                                    <div className="input-box">
                                        <span className="details">Status</span>
                                        <input onChange={onChange} type="text" value={contact.status} name="status" required />
                                    </div>
                                </div>
                                <div className="form_footer">
                                    <button type="submit" className="btn">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            }

            {!contact && <p>Contact not found</p>}

            <form style={{ display: 'none' }}>
                <input ref={inputRef} type="file" onChange={(event) => updatePhoto(event.target.files[0])} name="image" id="image" accept="image/*" />
            </form>
        </>
    );
}

export default ContactDetail;