import type { Schema } from "../amplify/data/resource";
import React, { useEffect, useState } from 'react'

function isUserInAGroup(client, userEmail) {
  const [groups, setGroups] = useState<Array<Schema["Group"]["type"]>>([]);
  useEffect(() => {
    client.models.Group.observeQuery().subscribe({
      next: (data) => setGroups([...data.items]),
    });
  }, []);
  
  const isInGroup: boolean[] = []
  for (const group of groups) {
    if (group.owner === userEmail || group.members?.includes(userEmail) || group.pending_members?.includes(userEmail)) {
        isInGroup.push(true)
    } else {
        isInGroup.push(false)
    }
  }

  if (isInGroup.length == 0) {
    return true; // Waiting on groups callback
  }

  return !isInGroup.every(b => !b) // Is anything in the list not false
}

export { isUserInAGroup };
