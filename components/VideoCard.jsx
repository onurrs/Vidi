import { useState } from "react";
import { ResizeMode, Video } from "expo-av";
import { View, Text, TouchableOpacity, Image, ImageBackground } from "react-native";

import { icons } from "../constants";
import { router } from "expo-router";

import { useVideoContext } from "../context/VideoContext";
import { useCreatorContext } from '../context/CreatorContext';
import { getCurrentUser, getProfileDetails } from "../lib/appwrite";


const VideoCard = ({ videoId, title, creator, avatar, thumbnail, video }) => {

  const [play, setPlay] = useState(false);

  const { setActiveVideo } = useVideoContext();
  const { setActiveCreator } = useCreatorContext();

  const goDetails = async () => {
    setActiveVideo(videoId);
    router.push('/details/VideoDetails');
  }

  const visitProfile = async () => {

    const userObject = await getProfileDetails(creator);


    if (userObject.id === (await getCurrentUser()).$id) {
      router.push('profile')
    } else {
      setActiveCreator(userObject);
      router.push('details/profileDetails')
    }
  }

  return (
    <View className="flex-col items-center px-4 mb-14">
      <View className="flex-row gap-3 items-start">
        <TouchableOpacity className="justify-center items-center flex-row flex-1" onPress={visitProfile}>
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
            <Image source={{ uri: avatar }} className="w-full h-full rounded-lg" resizeMode="cover" />
          </View>

          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text className="text-white font-psemibold text-sm" numberOfLines={1}>
              {title}
            </Text>
            <Text className="text-xs text-gray-100 font-pregular" numberOfLines={1}>
              @{creator}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={goDetails}>
          <View className="pt-2">
            <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
          </View>
        </TouchableOpacity>

      </View>

      {play ? (
        <Video
          source={{ uri: video }}
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
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
          />

          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

    </View>
  )
};

export default VideoCard;
