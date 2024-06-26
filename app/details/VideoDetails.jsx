import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import FormField from '../../components/FormField'
import { ResizeMode, Video } from 'expo-av'
import { icons } from '../../constants'
import CustomButton from '../../components/CustomButton'
import * as DocumentPicker from 'expo-document-picker'
import { router, useRouter } from 'expo-router'
import { createVideoPost, getVideoDetails } from '../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'
import { InfoBox, VideoCard } from '../../components'
import { updateUserAvatar, updateUserName } from '../../lib/appwrite'
import { useVideoContext } from '../../context/VideoContext';
import { deleteVideo } from '../../lib/appwrite'

const VideoDetails = () => {

    const { user } = useGlobalContext();
    const { activeVideo } = useVideoContext();
    const [videoObject, setVideoObject] = useState(null);
    const [play, setPlay] = useState(false);

    const [owner, setOwner] = useState(false)

    useEffect(() => {
        const fetchVideoDetails = async () => {
            if (activeVideo) {
                const details = await getVideoDetails(activeVideo);
                if (details) {
                    setVideoObject(details);
                }
            }
        };

        fetchVideoDetails();
    }, [activeVideo]);

    useEffect(() => {
        // Check if videoObject and user are defined before comparing
        if (videoObject && user && user.username === videoObject.creator.username) {
            setOwner(true); // Set owner state if conditions are met
        } else {
            setOwner(false); // Reset owner state otherwise
        }
    }, [videoObject, user]); // Dependency array for useEffect

    const deleteVideo = async () => {

    }

    const cannotDeleteVideo = async () => {
        Alert.alert("Hata", "Video sahibi değilsiniz.");
    }

    return (
        <SafeAreaView className="bg-primary h-full">
            <ScrollView className="px-4 my-6">
                <Text className="text-2xl text-white font-psemibold">
                    Video Detayları
                </Text>

                {videoObject && ( // Conditionally render if videoObject is not null
                    <View style={{ marginTop: 20 }}>
                        <Text className="font-psemibold text-2xl mt-5 text-secondary-100">Başlık:</Text>
                        <Text className="text-white font-psemibold text-xl mt-3">{videoObject.title}</Text>

                        <Text className="font-psemibold text-2xl mt-5 text-secondary-100">Video:</Text>
                        {play ? (
                            <Video
                                source={{ uri: videoObject.video }}
                                className="w-full h-60 rounded-xl mt-3 bg-black"
                                resizeMode={ResizeMode.CONTAIN}
                                useNativeControls
                                shouldPlay
                                onPlaybackStatusUpdate={(status) => {
                                    if (status.didJustFinish) {
                                        setPlay(false);
                                    }
                                }}
                            />
                        ) : (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => setPlay(true)}
                                className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
                            >

                                <Image
                                    source={{ uri: videoObject.thumbnail }}
                                    className="w-full h-full rounded-xl mt-3"
                                />

                                <Image
                                    source={icons.play}
                                    className="w-12 h-12 absolute"
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        )}

                        <Text className="font-psemibold text-2xl mt-10 text-secondary-100">Açıklama:</Text>
                        <Text className="text-white font-psemibold text-xl mt-3">{videoObject.description}</Text>


                        <Text className="font-psemibold text-2xl mt-5 text-secondary-100">Videoyu Yükleyen:</Text>
                        <View className="flex-row items-center mt-7">
                            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center mr-5">
                                <Image className="w-[90%] h-[90%] rounded-lg"
                                    source={{ uri: videoObject.creator.avatar }}
                                    resizeMode="cover"
                                />
                            </View>
                            <Text className="text-white font-psemibold">{videoObject.creator.username}</Text>
                        </View>
                        <Text className="font-psemibold text-sm mt-5 text-secondary-100">Yüklenme Tarihi:</Text>
                        <Text className="text-gray-400 mt-3">{new Date(videoObject.createdAt).toLocaleString()}</Text>
                    </View>
                )}

                {owner ?
                    <CustomButton
                        title="Videoyu Sil (ayarlanacak)"
                        handlePress={deleteVideo}
                        containerStyles="mt-7"
                    /> : <CustomButton
                        title="Videoyu Sil"
                        handlePress={cannotDeleteVideo}
                        containerStyles="mt-7 bg-gray-500"
                    />}



            </ScrollView>
        </SafeAreaView>
    )
}

export default VideoDetails