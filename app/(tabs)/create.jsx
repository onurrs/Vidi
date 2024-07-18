import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import FormField from '../../components/FormField'
import { ResizeMode, Video } from 'expo-av'
import { icons } from '../../constants'
import CustomButton from '../../components/CustomButton'
import * as DocumentPicker from 'expo-document-picker'
import { router } from 'expo-router'
import { createVideoPost } from '../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'

const Create = () => {

  const { user } = useGlobalContext();

  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    video: null,
    thumbnail: null,
    description: ''
  })

  const openPicker = async (selectType) => {
    const result = await DocumentPicker.getDocumentAsync({
      type:
        selectType === "image"
          ? ["image/png", "image/jpg", "image/jpeg"]
          : ["video/mp4", "video/gif"],
    });

    if (!result.canceled) {
      if (selectType === "image") {
        setForm({
          ...form,
          thumbnail: result.assets[0],
        });
      }

      if (selectType === "video") {
        setForm({
          ...form,
          video: result.assets[0],
        });
      }
    }
  };

  const submit = async () => {

    if (!form.thumbnail || !form.title || !form.video) {
      return Alert.alert('Hata', 'Lütfen tüm alanları doldurun.')
    }

    setUploading(true)

    if (!form.thumbnail && form.video) {
      setForm({
        ...form,
        thumbnail: form.video   //Düzenlenecek
      })
    }

    try {
      await createVideoPost({
        ...form, userId: user.$id
      })

      Alert.alert('Başarılı', 'Video başarılı bir şekilde yüklendi')
      router.push('/home')
    } catch (error) {
      Alert.alert('Hata', error.message)
    } finally {
      setForm({
        title: '',
        video: null,
        thumbnail: null,
        description: ''
      })

      setUploading(false);
    }
  }

  const notUploadedVideo = async () => {
    Alert.alert("Hata", "Herhangi bir video seçilmedi.");
  }

  const notUploadedThumbnail = async () => {
    Alert.alert("Hata", "Herhangi bir kapak resmi seçilmedi.");
  }

  const clearUploadedVideo = async () => {
    setForm({
      ...form,
      video: null
    });
  }

  const clearUploadedThumbnail = async () => {
    setForm({
      ...form,
      thumbnail: null
    });
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold">
          Video Yükle
        </Text>

        <FormField
          title="Video Başlığı"
          value={form.title}
          placeholder={"Videona havalı bir başlık koy..."}
          handleChangeText={(e) => setForm({ ...form, title: e })}
          otherStyles={"mt-10"}
          otherStyles2={"border border-purple-700 rounded-lg"}
        />

        <View className="mt-7 space-y-2 p-3 border-purple-900 rounded-lg border-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Video Yükle
          </Text>

          <TouchableOpacity onPress={() => openPicker('video')}>
            {form.video ? (
              <Video
                source={{ uri: form.video.uri }}
                className="w-full h-64 rounded-2xl"
                resizeMode={ResizeMode.COVER}
              />
            ) : (
              <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
                <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                  <Image
                    source={icons.upload}
                    resizeMode='contain'
                    className="w-1/2 h-1/2"
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
          {form.video ? (
            <CustomButton
              title={"Videoyu kaldır"}
              containerStyles={"mt-7"}
              handlePress={clearUploadedVideo}
            />
          ) :
            <CustomButton
              title={"Videoyu kaldır"}
              containerStyles={"mt-7 bg-gray-500"}
              handlePress={notUploadedVideo}
            />
          }
        </View>

        <View className="mt-7 space-y-2 border-2 p-3 border-purple-900 rounded-lg">
          <Text className="text-base text-gray-100 font-pmedium">
            Kapak Resmi
          </Text>

          <TouchableOpacity onPress={() => openPicker("image")}>
            {form.thumbnail ? (
              <Image
                source={{ uri: form.thumbnail.uri }}
                resizeMode="cover"
                className="w-full h-64 rounded-2xl"
              />
            ) : (
              <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 flex justify-center items-center flex-row space-x-2">
                <Image
                  source={icons.upload}
                  resizeMode="contain"
                  alt="upload"
                  className="w-5 h-5"
                />
                <Text className="text-sm text-gray-100 font-pmedium">
                  Dosya seçin
                </Text>
              </View>
            )}
          </TouchableOpacity>
          {form.thumbnail ? (
            <CustomButton
              title={"Kapak resmini kaldır"}
              containerStyles={"mt-7"}
              handlePress={clearUploadedThumbnail}
            />
          ) :
            <CustomButton
              title={"Kapak resmini kaldır"}
              containerStyles={"mt-7 bg-gray-500"}
              handlePress={notUploadedThumbnail}
            />
          }
        </View>

        <FormField
          title="Video Açıklaması"
          value={form.description}
          handleChangeText={(e) => setForm({ ...form, description: e })}
          otherStyles={"mt-7"}
        />

        <CustomButton
          title="Paylaş"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />

      </ScrollView>
    </SafeAreaView>
  )
}

export default Create