import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

import { router } from "expo-router";
import { Alert } from "react-native";

export const appwriteConfig = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.calexa.vidi',
  projectId: '667695dc0035eaea310d',
  databaseId: '667698fd000bc1447722',
  userCollectionId: '6676991d003599992420',
  videoCollectionId: '6676993400312b13c0f3',
  storageId: '66769ae3001ae273c3e4',
};

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register user
export async function createUser(email, password, username) {
  try {
    const responseUserName = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('username', username)]
    );

    if (responseUserName.total > 0) {
      throw new Error("Bu kullanıcı adı zaten mevcut.");
    }

    const responseUserMail = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('email', email)]
    );

    if (responseUserMail.total > 0) {
      throw new Error("Bu email zaten mevcut.");
    }

    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    //await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error);
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    const session = await account.createEmailSession(email, password);
    router.replace("/home");
    return session;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Sign Out
export async function signOut() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

// Upload File
export async function uploadFile(file, type) {
  if (!file) return;

  const { mimeType, ...rest } = file;
  const asset = { type: mimeType, ...rest };

  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
}

// Get File Preview
export async function getFilePreview(fileId, type) {
  let fileUrl;

  try {
    if (type === "video") {
      fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        appwriteConfig.storageId,
        fileId
      );
    } else {
      throw new Error("Dosya uzantısı hatası");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
}

// Create Video Post
export async function createVideoPost(form) {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        description: form.description,
        creator: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
}

// Update User Avatar
export async function updateUserAvatar(form, userId, oldAvatarUrl) {
  try {
    const avatarUrl = await uploadFile(form.avatar, "image");


    const fileIdRegex = /\/files\/([^\/]+)\//;
    const match = oldAvatarUrl.match(fileIdRegex);

    if (match && match[1]) {
      const fileId = match[1];
      console.log('Eski Dosya ID:', fileId);
      await storage.deleteFile(appwriteConfig.storageId, fileId);
    }

    await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, userId, { avatar: avatarUrl });

  } catch (error) {
    throw new Error(error);
  }
}

// Update username
export async function updateUserName(form, userId) {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('username', form.username)]
    );

    if (response.total > 0) {
      return Alert.alert('Hata', 'Bu isim zaten mevcut.');
    }

    // Kullanıcı adı mevcut değilse devam edin
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      { username: form.username }
    )

    Alert.alert('Başarılı', 'Kullanıcı adın başarılı bir şekilde güncellendi')
  } catch (error) {
    throw new Error(error);
  }
}


// Get all video Posts
export async function getAllPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.orderDesc('$createdAt')]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get video posts created by user
export async function getUserPosts(userId) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.equal("creator", userId)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get video posts that matches search query
export async function searchPosts(query) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.search("title", query)]
    );

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get latest created video posts
export async function getLatestPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.videoCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(7)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}


export async function getVideoDetails(videoId) {

  try {
    const response = await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.videoCollectionId, videoId);
    const videoObject = {
      title: response.title,
      thumbnail: response.thumbnail, // URL
      description: response.description,
      video: response.video, // URL
      creator: {
        username: response.creator.username,
        avatar: response.creator.avatar, // URL
      },
      createdAt: response.$createdAt, // Assuming createdAt is stored as $createdAt
      videoId: response.$id
    };

    return videoObject;
  } catch (error) {
    throw new Error(error)
  }
}

export async function getProfileDetails(userName) {

  try {

    const theUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("username", userName)]
    );

    const userObject = {
      username: theUser.documents[0].username,
      avatar: theUser.documents[0].avatar,
      id: theUser.documents[0].$id
    };

    return userObject;

  } catch (error) {
    throw new Error(error)
  }
}

export async function deleteVideo() {
  console.log("AAAA");

  return;
}