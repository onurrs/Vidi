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
import { InfoBox } from '../../components'
import { updateUserAvatar, updateUserName } from '../../lib/appwrite'

const SettingsPage = () => {

  const { user, setUser, setIsLogged } = useGlobalContext();

  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    avatar: null,
    username: '',
    password: ''
  })

  const openPicker = async (selectType) => {
    const result = await DocumentPicker.getDocumentAsync({
      type:
        selectType === "image"
          ? ["image/png", "image/jpg", "image/jpeg"]
          : ["video/mp4", "video/gif"],
    });

    if (!result.canceled) {
      setForm({
        ...form,
        avatar: result.assets[0],
      });
    }
  };

  const submitAvatar = async () => {
    if (!form.avatar) {
      return Alert.alert('Hata', 'Lütfen bir fotoğraf seçiniz')
    }

    setUploading(true)

    try {

      await updateUserAvatar({
        ...form
      }, user.$id, user.avatar)

      Alert.alert('Başarılı', 'Profil fotoğrafın başarılı bir şekilde güncellendi')
      router.push('/profile')
    } catch (error) {
      Alert.alert('Hata', error.message)
    } finally {
      setForm({
        ...form,
        avatar: null
      })

      setUploading(false);
    }
  }

  const submitUsername = async () => {
    if (!form.username) {
      return Alert.alert('Hata', 'Lütfen yeni bir isim giriniz.')
    }
    if (form.username == user?.username) {
      return Alert.alert('Hata', 'Yeni isim eski isimle aynı olamaz.')
    }

    setUploading(true)

    try {

      await updateUserName({
        ...form
      }, user.$id)


      router.push('/profile')
    } catch (error) {
      Alert.alert('Hata', error.message)
    } finally {
      setForm({
        ...form,
        username: ''
      })

      setUploading(false);
    }
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold">
          Profil Ayarları
        </Text>

        <View className="items-start mt-7">
          <View className="w-20 h-20 border border-secondary rounded-lg flex justify-center items-center">
            <Image
              source={{ uri: user?.avatar }}
              className="w-[90%] h-[90%] rounded-lg"
              resizeMode="cover"
            />
          </View>


          <InfoBox
            title={user?.username}
            containerStyles="mt-5"
            titleStyles="text-lg"
          />
        </View>

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Profil fotoğrafını değiştir
          </Text>

          <TouchableOpacity onPress={() => openPicker("image")}>
            {form.avatar ? (
              <Image
                source={{ uri: form.avatar.uri }}
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
        </View>

        <CustomButton
          title="Fotoğrafı Güncelle"
          handlePress={submitAvatar}
          containerStyles="mt-7"
          isLoading={uploading}
        />

        <FormField
          title="Yeni kullanıcı adı:"
          value={form.username}
          handleChangeText={(e) => setForm({ ...form, username: e })}
          otherStyles={"mt-7"}
        />
        <CustomButton
          title="Kullanıcı Adını Güncelle"
          handlePress={submitUsername}
          containerStyles="mt-7"
        />


      </ScrollView>
    </SafeAreaView>
  )
}

export default SettingsPage