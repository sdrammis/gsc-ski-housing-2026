import type { Schema } from "../amplify/data/resource";
import { Button, useAuthenticator } from '@aws-amplify/ui-react';
import { useEffect, useState } from 'react';
import { generateClient } from "aws-amplify/data";
import { Link, Route, Routes } from 'react-router-dom'
import { isUserInAGroup } from "./utils";


const client = generateClient<Schema>();

function requestToJoinGroup() {
  // TODO
  return
}

function App() {
  const { signOut, user } = useAuthenticator();
  const userEmail = user.signInDetails?.loginId;

  const [groups, setGroups] = useState<Array<Schema["Group"]["type"]>>([]);
  useEffect(() => {
    client.models.Group.observeQuery().subscribe({
      next: (data) => setGroups([...data.items]),
    });
  }, []);

  const { loading, inGroup } = isUserInAGroup(client, userEmail);
  
  function getGroupAction(group) {
    // 1) If group owner -> Manage button
    if (group.owner == userEmail) {
      return (
        <Link to="/manage-group">
          <button className='li-btn'>Manage</button>
        </Link>
      );
    }
    // 2) If member -> Leave button
    if (group.members?.includes(userEmail)) {
      return <LeaveButton group={group} />;
    } 
    // 3) If pending member -> Cancel request button
    if (group.pending_members?.includes(userEmail)) {
      return <span style={{fontSize: 14, color: 'red'}}>Request pending owner approval...</span>
      // return <button className='li-btn li-btn-red'>Cancel request</button>;
    }

    // 4) If full -> Full label
    const totalMembers = 1 + (group.members?.length || 0) + (group.pending_members?.length || 0);
    if (totalMembers >= 6) {
      return <span style={{color: 'red'}}>Full</span>;
    }

    // 5) Else -> Request to join button
    return <RequestButton group={group} />;
  }

  function LeaveButton({ group }) {
    const handleLeave = async () => {
      if (window.confirm(`Are you sure you want to leave "${group.name}"?`)) {
        try {
          await client.models.Group.update({
            id: group.id,
            members: (group.members || []).filter(e => e !== userEmail)
          });
          // Page will refresh automatically due to observeQuery
        } catch (error) {
          alert("There was an error leaving the group.");
        }
      }
    };

    return <button className='li-btn li-btn-red' onClick={handleLeave}>Leave</button>;
  }

  function RequestButton({ group }) {
    const handleRequest = async () => {
      if (window.confirm(`Are you sure you want to request joining "${group.name}"?`)) {
        try {
          await client.models.Group.update({
            id: group.id,
            pending_members: [...(group.pending_members || []), userEmail]
          });
          // Page will refresh automatically due to observeQuery
        } catch (error) {
          alert("There was an error requesting to join the group.");
        }
      }
    };

    return <button className='li-btn' onClick={handleRequest}>Request to join</button>;
  }

  console.log(groups)

  return (
    <div style={{width: '50em'}}>
      <h2> MIT GSC 2026 Ski Trip </h2>
      <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
        <Link to="/new-group">
          <button disabled={loading || inGroup}>Create new group +</button>
        </Link>
        <button style={{backgroundColor: "#e5e5e5", color: "black", borderColor: "black" }} onClick={signOut}>Sign out</button>
      </div>
      <ul>
        {[...groups].sort((a, b) => {
          const aIn = (a.owner === userEmail || a.members?.includes(userEmail) || a.pending_members?.includes(userEmail)) ? 1 : 0;
          const bIn = (b.owner === userEmail || b.members?.includes(userEmail) || b.pending_members?.includes(userEmail)) ? 1 : 0;
          return bIn - aIn;
        }).map((group) => {
          const isUserInThisGroup = group.owner === userEmail || group.members?.includes(userEmail) || group.pending_members?.includes(userEmail);
          return (
            <li key={group.id} style={{maxWidth: '100%', border: isUserInThisGroup ? '2px solid blue' : 'none' }}>
              <div style={{ fontWeight: 'bold' }}>{group.name}</div>
              <div style={{ fontSize: 12 }}>Owner: {group.owner.split('@')[0]}</div>
              <div style={{ fontSize: 12 }}>Members: {group.members?.map(p => p?.split('@')[0]).join(', ')}</div>
              <div style={{ fontSize: 12 }}>Pending: {group.pending_members?.map(p => p?.split('@')[0]).join(', ')}</div>
              {getGroupAction(group)}
            </li>
          );
        })}
      </ul>
    </div>
  )
}

export default App;
