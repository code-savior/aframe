var project;
var projectId;
var API_7NIU = 'https://pre-cdata.kandao360.com';

function getSceneFromProject(sceneid) {
    const media = getSceneMedia(sceneid);
    const hotspots = getSceneHotspots(sceneid);
    const photoEmbeds = getScenePhotoEmbeds(sceneid);
    const videoEmbeds = getSceneVideoEmbeds(sceneid);
    const audioEmbeds = getSceneAudioEmbeds(sceneid);

    return {
        type: media.type,
        media: media.path,
        hotspots,
        photoEmbeds,
        videoEmbeds,
        audioEmbeds,
    };
}

function getSceneHotspots(sceneid) {
    const hotspots = project.hotspots.filter(function(hotspot) {
        return hotspot.source_stage.uuid === sceneid && hotspot.visible === true
    });

    return hotspots.map(function(hotspot){
        const position = convertPosition({yaw: hotspot.pos_yaw, pitch: hotspot.pos_pitch});
        return {
            icon: `assets/icon/hotspot/${hotspot.link_icon}${hotspot.link_icon.indexOf('.gif') > -1 ? '' : '.png' }`,
            title: hotspot.title,
            sceneid: hotspot.target_stage.uuid,
            position: position,
        }
    });
}

function convertPosition(position){
    return {
        yaw: THREE.Math.degToRad(180 - position.yaw),
        pitch: THREE.Math.degToRad(90 - position.pitch),
    };
}

function convertRotation(rotation){
    return {
        yaw: THREE.Math.degToRad(rotation.yaw),
        pitch: THREE.Math.degToRad(rotation.pitch),
        roll: THREE.Math.degToRad(rotation.roll),
    };
}

function getScenePhotoEmbeds(sceneid) {
    const embeds = project.embeds.filter(function(embed) {
        return embed.source_stage.uuid === sceneid && embed.embed_type === 1 && embed.visible === true
    });

    return convertEmbed(embeds);
}

function convertEmbed(embeds){
    return embeds.map(function(embed){
        const media = getEmbedMedia(embed);
        const position = convertPosition({yaw: embed.pos_yaw, pitch: embed.pos_pitch});
        const rotation = convertRotation({yaw: embed.spin_polar_yaw, pitch: embed.spin_polar_pitch, roll: embed.spin_polar_roll});
        return {
            media: media.media,
            width: media.width,
            height: media.height,
            position: position,
            rotation: rotation,
        }
    });
}

function getEmbedMedia(embed){
    if(embed.embed_type !== 5 && embed.resized_embed_media_path){
        return {
            media: `${API_7NIU}/${projectId}/${embed.resized_embed_media_path}`,
            width: embed.resized_embed_media_width,
            height: embed.resized_embed_media_height,
        };
    }else{
        const media = getMedia(embed.embed_media.uuid);
        return {
            media: embed.embed_type !== 5 ? `${API_7NIU}/${projectId}/${media.path}` : media.path,
            width: embed.embed_type !== 5 ? media.width : embed.resized_embed_media_width,
            height: embed.embed_type !== 5 ? media.height : embed.resized_embed_media_height,
        };
    }
}

function getSceneVideoEmbeds(sceneid) {
    const embeds = project.embeds.filter(function(embed) {
        return embed.source_stage.uuid === sceneid && (embed.embed_type === 0 || embed.embed_type === 5) && embed.visible === true
    });
    return convertEmbed(embeds);
}

function getSceneAudioEmbeds(sceneid) {
    const embeds = project.embeds.filter(function(embed) {
        return embed.source_stage.uuid === sceneid && embed.embed_type === 3 && embed.visible === true
    });

    return embeds.map(function(embed){
        const position = convertPosition({yaw: embed.pos_yaw, pitch: embed.pos_pitch});
        const media = getMedia(embed.embed_media.uuid);
        return {
            media: `${API_7NIU}/${projectId}/${media.path}`,
            volume: embed.audio_volume/100,
            loop: embed.play_loop,
            position: position,
        }
    });
}

function getSceneMedia(sceneid) {
    const scene = project.stages.filter(function(stage) {
        return stage.uuid === sceneid
    })[0];
    const media = getMedia(scene.media.uuid);
    const path =  media.type === 'Live' ? media.path : `${API_7NIU}/${projectId}/${media.path}`;
    let type = media.type === 'Video' || media.type === 'Live' ? 'video' : 'photo';
    return {
        type,
        path,
    };
}

function getMedia(mediaid) {
    const media = project.medias.filter(function(media) {
        return media.uuid === mediaid
    })[0];
    return media;
}

function getFirstSceneid() {
    return project.stages.filter(function(stage) {
        return stage.isStart
    })[0].uuid
}