
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import "./index.css";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [members, setMembers] = useState([]);
  const [teamFilter, setTeamFilter] = useState("All");
  const [showLogs, setShowLogs] = useState(false);
  const [logCode, setLogCode] = useState("");
  const OWNER_CODE = "OWNER123";
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "members"), (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "logs"), (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setEmail(""); setPassword("");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const addLog = async (action) => {
    await addDoc(collection(db, "logs"), { action, time: new Date().toLocaleString() });
  }

  const addMember = async () => {
    const name = prompt("Member Name:");
    if(!name) return;
    await addDoc(collection(db, "members"), {
      name,
      rank: "",
      serverRank: "",
      user: "",
      discordID: "",
      usualActiveTime: "",
      promotionDate: "",
      guild: "",
      testerARC: false,
      testerAC: false,
      bio: "",
      note: "",
      team: "AC"
    });
    await addLog(`Added member: ${name}`);
  };

  const editMember = async (member) => {
    const name = prompt("Edit Name:", member.name);
    if(!name) return;
    const docRef = doc(db, "members", member.id);
    await updateDoc(docRef, { name });
    await addLog(`Edited member: ${name}`);
  };

  const deleteMember = async (member) => {
    if(window.confirm(`Delete ${member.name}?`)) {
      await deleteDoc(doc(db, "members", member.id));
      await addLog(`Deleted member: ${member.name}`);
    }
  };

  const filteredMembers = members.filter(m => teamFilter === "All" || m.team === teamFilter);

  if(!user) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-600 to-blue-500 text-white p-4">
        <h1 className="text-3xl font-bold mb-4">CL GAMES STAFF AC/ARC - made by devsamisan</h1>
        <div className="mb-4">
          <select value={teamFilter} onChange={e=>setTeamFilter(e.target.value)} className="p-2 rounded text-black">
            <option value="All">All Teams</option>
            <option value="AC">AC</option>
            <option value="ARC">ARC</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredMembers.map(member=>(
            <div key={member.id} className="bg-gray-800 p-4 rounded shadow-lg hover:scale-105 transition-transform">
              <h2 className="text-xl font-bold mb-2">{member.name}</h2>
              <p>Rank: {member.rank}</p>
              <p>Server Rank: {member.serverRank}</p>
              <p>User: {member.user}</p>
              <p>ID: {member.discordID}</p>
              <p>Team: {member.team}</p>
              <p>Tester AC: {member.testerAC ? "Yes" : "No"}</p>
              <p>Tester ARC: {member.testerARC ? "Yes" : "No"}</p>
              <p>Promotion: {member.promotionDate}</p>
              <p>Guild: {member.guild}</p>
              <p>Active Time: {member.usualActiveTime}</p>
              <p>Bio: {member.bio}</p>
              <p>Note: {member.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-lg">Admin / Owner Login</h2>
          <input className="p-2 m-2 rounded text-black" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input type="password" className="p-2 m-2 rounded text-black" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="bg-yellow-500 p-2 rounded font-bold" onClick={handleLogin}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-blue-500 text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">CL GAMES STAFF AC/ARC - made by devsamisan</h1>
        <div className="space-x-2">
          <button className="bg-red-600 px-3 py-1 rounded" onClick={handleLogout}>Logout</button>
          <button className="bg-green-500 px-3 py-1 rounded" onClick={addMember}>Add Member</button>
          <button className="bg-yellow-500 px-3 py-1 rounded" onClick={()=>setShowLogs(true)}>Owner Logs</button>
        </div>
      </div>

      <div className="mb-4">
        <select value={teamFilter} onChange={e=>setTeamFilter(e.target.value)} className="p-2 rounded text-black">
          <option value="All">All Teams</option>
          <option value="AC">AC</option>
          <option value="ARC">ARC</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredMembers.map(member=>(
          <div key={member.id} className="bg-gray-800 p-4 rounded shadow-lg hover:scale-105 transition-transform">
            <h2 className="text-xl font-bold mb-2">{member.name}</h2>
            <p>Rank: {member.rank}</p>
            <p>Server Rank: {member.serverRank}</p>
            <p>User: {member.user}</p>
            <p>ID: {member.discordID}</p>
            <p>Team: {member.team}</p>
            <p>Tester AC: {member.testerAC ? "Yes" : "No"}</p>
            <p>Tester ARC: {member.testerARC ? "Yes" : "No"}</p>
            <p>Promotion: {member.promotionDate}</p>
            <p>Guild: {member.guild}</p>
            <p>Active Time: {member.usualActiveTime}</p>
            <p>Bio: {member.bio}</p>
            <p>Note: {member.note}</p>
            <div className="mt-2 flex space-x-2">
              <button className="bg-blue-500 p-1 rounded" onClick={()=>editMember(member)}>Edit</button>
              <button className="bg-red-500 p-1 rounded" onClick={()=>deleteMember(member)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
