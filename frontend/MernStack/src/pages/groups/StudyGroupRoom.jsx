import React, { useEffect, useRef, useState } from "react";
import "./studygrouproom.css";
import axios from "axios";
import { server } from "../../main";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import Loading from "../../components/loading/Loading";
import { UserData } from "../../context/UserContext";

const StudyGroupRoom = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = UserData();

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [notes, setNotes] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  async function fetchGroup() {
    try {
      const { data } = await axios.get(`${server}/api/group/${params.id}`, {
        headers: { token: localStorage.getItem("token") },
      });
      setGroup(data.group);
      setNotes(data.group.notes || "");
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Cannot open this group");
      navigate("/groups");
    }
  }

  async function fetchMessages() {
    try {
      const { data } = await axios.get(
        `${server}/api/group/${params.id}/messages`,
        { headers: { token: localStorage.getItem("token") } },
      );
      setMessages(data.messages);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchGroup();
    fetchMessages();

    const socket = io(server, {
      auth: { token: localStorage.getItem("token") },
    });
    socketRef.current = socket;

    socket.emit("joinGroup", params.id);
    socket.on("newMessage", (msg) =>
      setMessages((prev) => [...prev, msg]),
    );
    socket.on("notesUpdated", ({ notes }) => setNotes(notes));

    return () => {
      socket.emit("leaveRoom", params.id);
      socket.disconnect();
    };
  }, [params.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendHandler = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socketRef.current.emit("sendMessage", { groupId: params.id, text });
    setText("");
  };

  const inviteHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${server}/api/group/${params.id}/invite`,
        { email: inviteEmail },
        { headers: { token: localStorage.getItem("token") } },
      );
      toast.success(data.message);
      setInviteEmail("");
      fetchGroup();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const saveNotes = async () => {
    try {
      const { data } = await axios.put(
        `${server}/api/group/${params.id}/notes`,
        { notes },
        { headers: { token: localStorage.getItem("token") } },
      );
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const leaveHandler = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;
    try {
      await axios.post(
        `${server}/api/group/${params.id}/leave`,
        {},
        { headers: { token: localStorage.getItem("token") } },
      );
      toast.success("You left the group");
      navigate("/groups");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  if (loading) return <Loading />;
  if (!group) return null;

  return (
    <div className="room-page">
      <div className="room-header">
        <div>
          <h2>{group.name}</h2>
          <p>{group.course?.title}</p>
        </div>
        <button className="leave-btn" onClick={leaveHandler}>
          Leave Group
        </button>
      </div>

      <div className="room-layout">
        <div className="chat-panel">
          <div className="messages">
            {messages.length === 0 && (
              <p className="chat-empty">No messages yet. Say hi! 👋</p>
            )}
            {messages.map((m) => (
              <div
                key={m._id}
                className={`message ${m.sender === user._id ? "own" : ""}`}
              >
                <span className="message-sender">{m.senderName}</span>
                <span className="message-text">{m.text}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input" onSubmit={sendHandler}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
            />
            <button className="common-btn">Send</button>
          </form>
        </div>

        <div className="side-panel">
          <div className="members-box">
            <h3>Members ({group.members.length})</h3>
            <ul>
              {group.members.map((m) => (
                <li key={m._id}>
                  <span>{m.name}</span>
                  {group.owner?._id === m._id && (
                    <span className="owner-tag">owner</span>
                  )}
                </li>
              ))}
            </ul>
            <form onSubmit={inviteHandler} className="invite-form">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Invite by email"
                required
              />
              <button className="common-btn">Invite</button>
            </form>
          </div>

          <div className="notes-box">
            <h3>Shared Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              placeholder="Write shared notes for the group..."
            ></textarea>
            <button className="common-btn" onClick={saveNotes}>
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGroupRoom;
