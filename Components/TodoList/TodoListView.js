//todo item komponentlerini tutan liste
import React, { useCallback, useEffect, useRef } from 'react';
import { View, FlatList,StyleSheet,Text ,LayoutAnimation, ActivityIndicator} from 'react-native';
import ToDoItem from './ToDoItem';
import  { useTodoList } from './TodoListData';
import {HeavyHaptic,ErrorHaptic,LightHaptic,MediumHaptic,SuccessHaptic,WarningHaptic} from '../CodeBase/Haptic/HapticHelper';
import { useNavigation } from '@react-navigation/native';
import DraggableFlatList,{ScaleDecorator} from 'react-native-draggable-flatlist'
import { GlobalStyles } from '../CodeBase/Fonts/FontStyles';
export default function TodoListView() {

    const {todoList,setTodoList,loadList,saveList} = useTodoList();
    const navigation = useNavigation();
    const [isLoaded, setIsLoaded] = React.useState(false);
    const DragableFlatListRef = useRef(null);

    const HandleDelete = useCallback((id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Animasyonlu geçiş
        setTodoList((prevTodoList) => {
            const updatedList = prevTodoList.filter(item => item.id !== id);
            saveList(updatedList); // Güncellenmiş listeyi kaydetme
            console.log("Silme işlemi gerçekleşti ", updatedList);
            return updatedList;
        });
        LightHaptic();
    }, [setTodoList]);

    const HandleEdit = (item) => {
        navigation.navigate('Create New Item', { item }); // item verisini sayfaya gönder
        LightHaptic();
    };

    const ChangeCheckBox = useCallback((id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Animasyonlu geçiş
        setTodoList((prevTodoList) => {
            const updatedList = prevTodoList.map((item) =>
                item.id === id ? { ...item, isDone: !item.isDone } : item
            );

            saveList(updatedList); // Güncellenmiş listeyi kaydetme
            updatedList.filter((item) => item.id === id)[0].isDone ? SuccessHaptic() : LightHaptic();
            // `isDone` durumuna göre listeyi yeniden sıralar
            return updatedList.sort((a, b) => a.isDone - b.isDone);
        });
    }, [setTodoList]);

    useEffect(() => {

        loadList().then(
            ()=>{
                console.log("Liste yüklendi")
                setIsLoaded(true);
                }
            ).catch((e)=>{
                console.error('Liste yükleme hatası:', e);
            });
        
    },[]);

    //todolistin bütün idlerini yazdırır
    //console.log(todoList.map((item) => item.id));
    return (
        !isLoaded ? <View style={styles.LoadingViewStyle}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
        :
        <View style={styles.viewStyle}>
            
            {todoList.length > 0 ? (
                <DraggableFlatList
                style={{width:'100%',height:'100%'}}
                    ref={DragableFlatListRef}
                    data={todoList}
                    renderItem={({item,drag}) => <ScaleDecorator  activeScale={1.1}><ToDoItem item={item} ChangeCheckBox={ChangeCheckBox} onDelete={HandleDelete} onEdit={HandleEdit} 
                    onLongPress={()=>{
                       if(!item.isDone){
                        drag();
                        LightHaptic();
                        }
                        else{
                            WarningHaptic();
                        }
                        }}
                        />
                    
                    
                    </ScaleDecorator>}
                    keyExtractor={item => item.id.toString()}
                    onDragEnd={({ data }) => {
                        setTodoList(data);
                    }}
                />

            ) : (
                <View style={styles.noTaskContainer}>
                    <Text style={styles.noTaskText}>Hey! You don't have any tasks yet. Add your first one!</Text>
                </View>
            )}
        </View>
        
        
    );
}

const styles = StyleSheet.create({
    contentText: {
        ...GlobalStyles.primaryText,
        fontSize: 18,
        color: '#000',
        alignContent: 'center',
        textAlign: 'center',
    },
    noTaskContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noTaskText: {
        ...GlobalStyles.primaryText,
        fontSize: 22,
        padding: 45,
        color: '#000',
        textAlign: 'center',
    },
    viewStyle: {
        backgroundColor: '#ffff',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',

    },
    LoadingViewStyle: {
        flex: 1,
        //itemlerin arasında boşluk olacak şekilde düzenle
        //yatayda sırala
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        textsise: 45,
    },
    loadingText: {
        ...GlobalStyles.primaryText,
        fontSize: 20,
        color: '#000',
    },
});