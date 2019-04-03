import React from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import MapView, { MapEvent, Marker } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import data from './game.data.json';

interface IMarker { lat: number; lon: number; title?: string; }

interface IState {
    region: {
        latitude: number,
        longitude: number,
        latitudeDelta: number,
        longitudeDelta: number
    };
    kilometers: number;
    score: number;
    city?: {
        name: string;
        pos: {
            lat: number;
            lng: number;
        }
    };
    markers?: IMarker[];
}

export class Game extends React.Component<{}, IState> {
    public constructor(props: {}) {
        super(props);
        this.state = {
            region: {
                latitude: 46.6765288,
                longitude: 14.6822894,
                latitudeDelta: 60.9,
                longitudeDelta: 5
            },
            kilometers: 1500,
            score: 0
        };
    }


    public setMarkers = (lat1: number, lon1: number, lat2: number, lon2: number, title: string) => {
        this.setState({
            markers: [{ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2, title }]
        });
    };

    public restart = () => {
        this.setState({
            kilometers: 1500,
            score: 0,
            markers: undefined,
            city: undefined
        });
    };

    public componentDidUpdate(): void {
        if (this.state.kilometers <= 0) {
            Alert.alert('Game Over', `Your score is ${this.state.score}`, [
                { text: 'Restart', onPress: () => this.restart() }
            ]);
        }
    }

    public handleMapPress = (event: MapEvent) => {
        if (!this.state.city) {
            Alert.alert('Choose city');
            return;
        }
        const { latitude, longitude } = event.nativeEvent.coordinate;
        const diff: number = this._distance(latitude, longitude, this.state.city.pos.lat, this.state.city.pos.lng);
        if (diff <= 50) {
            this.setState({ score: this.state.score + 1 });
        } else {
            this.setState({
                kilometers:
                    Number(Number(this.state.kilometers - diff).toFixed(0)) <= 0
                        ? 0
                        : Number(Number(this.state.kilometers - diff).toFixed(0))
            });
        }
        this.setMarkers(latitude, longitude, this.state.city.pos.lat, this.state.city.pos.lng, this.state.city.name);
    };

    public render(): JSX.Element {
        return (
            <View style={styles.container}>
                <View style={styles.hint}>
                    <Text>{this.state.score}</Text>
                </View>
                <View style={styles.hint}>
                    <Text>{this.state.kilometers}</Text>
                </View>
                <View style={styles.step}>
                    <Text>Select the location of</Text>
                    <Text style={{ fontWeight: 'bold' }}>{this.state.city && this.state.city.name}</Text>
                </View>
                <MapView
                    style={styles.map}
                    zoomEnabled={false}
                    scrollEnabled={false}
                    initialRegion={this.state.region}
                    onPress={this.handleMapPress}
                >
                    {this.state.markers && this.state.markers.map((marker: IMarker, index: number) => (
                        <Marker
                            key={index}
                            coordinate={{
                                latitude: marker.lat,
                                longitude: marker.lon
                            }}
                            title={marker.title || 'Your choose'}
                        />
                    ))}
                </MapView>
                <View style={styles.action}>
                    <Button
                        onPress={this.onPressPlace}
                        title='Place'
                        color='#999'
                        accessibilityLabel='Place the marker for a city'
                    />
                </View>
            </View>
        );
    }

    public onPressPlace = () => {
        const i: number = Math.floor(Math.random() * data.cities.length);
        this.setState({
            city: {
                name: data.cities[i].name,
                pos: data.cities[i].position
            },
            markers: []
        });
    };

    private _distance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        if (lat1 === lat2 && lon1 === lon2) {
            return 0;
        } else {
            const radlat1: number = (Math.PI * lat1) / 180;
            const radlat2: number = (Math.PI * lat2) / 180;
            const theta: number = lon1 - lon2;
            const radtheta: number = (Math.PI * theta) / 180;
            let dist: number =
                Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = (dist * 180) / Math.PI;
            dist = dist * 60 * 1.1515;
            return dist;
        }
    }
}

// tslint:disable-next-line: typedef
const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 15,
        marginTop: 25,
        flexDirection: 'column',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    hint: {
        backgroundColor: '#eee',
        borderColor: '#000',
        flex: 0,
        height: 40,
        width: '100%',
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    step: {
        flex: 0,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    map: {
        margin: 5,
        width: '100%',
        flex: 1,
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    action: {
        width: '100%',
        height: 40,
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
    }
});
