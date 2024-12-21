import { getDatabase, ref, get } from "firebase/database";

const fetchMembersEmail = async (id: string): Promise<string> => {
  try {
    const db = getDatabase();
    const reference = ref(db, `users/${id}`);
    const snapshot = await get(reference);
    const userData = snapshot.val();
    return userData.email || "";
  } catch (error) {
    console.error("Error fetching user email:", error);
    return "";
  }
};

export { fetchMembersEmail };
