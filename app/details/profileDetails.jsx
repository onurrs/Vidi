import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, FlatList, TouchableOpacity, Text } from "react-native";

import { icons } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import { getProfileDetails, getUserPosts, signOut } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { CustomButton, EmptyState, InfoBox, VideoCard } from "../../components";
import { useEffect, useState } from "react";
import { useCreatorContext } from "../../context/CreatorContext";
import VideoCard2 from "../../components/VideoCard2";

const ProfileDetails = () => {
    const { activeCreator } = useCreatorContext();

    const { data: posts } = useAppwrite(() => getUserPosts(activeCreator.id));

    const follow = async () => {

    }

    return (
        <SafeAreaView className="bg-primary h-full">
            <FlatList
                data={posts}
                keyExtractor={(item) => item.$id}
                renderItem={({ item }) => (
                    <VideoCard2
                        videoId={item.$id}
                        title={item.title}
                        thumbnail={item.thumbnail}
                        video={item.video}
                        creator={item.creator.username}
                        avatar={item.creator.avatar}
                    />
                )}
                ListEmptyComponent={() => (
                    <EmptyState
                        title="Hiç Video Bulunamadı"
                        subtitle="Bu profile ait hiç bir video bulunmamaktadır."
                    />
                )}
                ListHeaderComponent={() => (
                    <View className="w-full flex justify-center items-center mt-16 mb-12 px-4">

                        <View className="w-36 h-36 border border-secondary rounded-lg flex justify-center items-center">
                            <Image
                                source={{ uri: activeCreator.avatar }}
                                className="w-[90%] h-[90%] rounded-lg"
                                resizeMode="cover"
                            />
                        </View>

                        <InfoBox
                            title={activeCreator.username}
                            containerStyles="mt-5"
                            titleStyles="text-lg"
                        />

                        <View className="mt-5 flex flex-row">
                            <InfoBox
                                title={posts.length || 0}
                                subtitle="Video"
                                titleStyles="text-xl"
                                containerStyles="mr-10"
                            />
                            <InfoBox
                                title="1.2k"
                                subtitle="Takipçi"
                                titleStyles="text-xl"
                            />
                        </View>
                        <CustomButton
                            title="Takip et"
                            handlePress={follow}
                            containerStyles="mt-7 pl-7 pr-7"
                        />
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default ProfileDetails;