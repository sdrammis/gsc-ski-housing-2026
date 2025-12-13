import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import React, { useEffect, useState } from 'react'
import { generateClient } from "aws-amplify/data";
import { useNavigate } from 'react-router-dom'
import { isUserInAGroup } from './utils.tsx'


const client = generateClient<Schema>();

async function insertGroup(owner, name, bed, gender, navigate) {
  const preferred_gender = ({ 'Male': "MALE", 'Female': "FEMALE", 'No preference': "NONE"})[gender]
  const { data, errors } = await client.models.Group.create({ 
    owner: owner,
    name: name, 
    members: [], 
    pending_members: [],
    split_bed: bed, 
    preferred_gender: preferred_gender
  });

  if (!errors) {
    navigate("/")
  } else {
    alert("There was an error.")
  }
}

// function isUserInAGroup(userEmail) {
//   const [groups, setGroups] = useState<Array<Schema["Group"]["type"]>>([]);
//   useEffect(() => {
//     client.models.Group.observeQuery().subscribe({
//       next: (data) => setGroups([...data.items]),
//     });
//   }, []);
  
//   let userInGroup = undefined;
//   for (const group of groups) {
//     if (group.owner === userEmail || group.members?.includes(userEmail) || group.pending_members?.includes(userEmail)) {
//       userInGroup = true;
//     }
//   }

//   if (userInGroup === undefined) {
//     return true
//   }
//   return userInGroup;
// }

function CreateNewGroup() {
  const { user } = useAuthenticator();
  const userEmail = user.signInDetails?.loginId;

  const [groupName, setGroupName] = useState("")
  const [gender, setGender] = useState("No preference")
  const [bed, setBed] = useState("yes")

  const navigate = useNavigate()
  const handleSubmit = e => {
    e.preventDefault()
    insertGroup(userEmail, groupName, bed, gender, navigate)
  }

  // Only users not in a group should be able to access this page
  const isInGroup = isUserInAGroup(client, userEmail);

  // TODO: Fix if not in a group it saying "you're already in a group"
  
  return isInGroup ? ( <h2>You are already in a group.</h2>) : (
      <div>
          <h2>Create a new group</h2>
          <form onSubmit={handleSubmit}>
            <label>Group name: <input type='text' value={groupName} onChange={(e) => setGroupName(e.target.value)} /> </label>

            <div>
                <label>Gender preference: </label>
                <select defaultValue={gender} onChange={(e) => setGender(e.target.value)}>
                    <option key={0}>No preference</option>
                    <option key={1}>Male</option>
                    <option key={2}>Female</option>
                </select>
            </div>

            <div>
                <label>King bed split: </label>
                <select defaultValue={bed} onChange={(e) => setBed(e.target.value)}>
                    <option key={0}>Yes</option>
                    <option key={1}>No</option>
                </select>
            </div>

            <button type="submit" disabled={groupName.trim() === ""}> Submit </button>
          </form>
      </div>
    )
}

export default CreateNewGroup;
