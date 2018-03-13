function
    getOrientationString(vector) {

    const vec3 =
        convertToVector3(vector);



    let orientation =
        '';

    const orientationX = vec3.x
        < 0
        ? 'R'
        :
        'L';

    const orientationY = vec3.y
        < 0
        ? 'A'
        :
        'P';

    const orientationZ = vec3.z
        < 0
        ? 'F'
        :
        'H';



    const abs = {

        x: Math.abs(vec3.x),

        y: Math.abs(vec3.y),

        z: Math.abs(vec3.z),

    }



    for (let i =
        0; i <
        3; i++) {

        if (abs.x >
            0.0001 && abs.x
            > abs.y && abs.x
            > abs.z) {

            orientation += orientationX;

            abs.x =
                0;

        } else if (abs.y >
            0.0001 && abs.y
            > abs.x && abs.y
            > abs.z) {

            orientation += orientationY;

            abs.y =
                0;

        } else if (abs.z >
            0.0001 && abs.z
            > abs.x && abs.z
            > abs.y) {

            orientation += orientationZ;

            abs.z =
                0;

        } else {

            break;

        }

    }

    return orientation;

}

function
    convertToVector3(vector) {

    return {

        x: vector[0] -
            0 ||
            0,

        y: vector[1] -
            0 ||
            0,

        z: vector[2] -
            0 ||
            0,

    }

}

function
    invertOrientationString(str) {

    let inverted = str.replace('H',
        'f');



    inverted = inverted.replace('F',
        'h');

    inverted = inverted.replace('R',
        'l');

    inverted = inverted.replace('L',
        'r');

    inverted = inverted.replace('A',
        'p');

    inverted = inverted.replace('P',
        'a');

    inverted = inverted.toUpperCase();



    return inverted;

}

function
    parseImageOrientation(imageOrientation) {

    const rowCosines = imageOrientation.slice(0,
        3);

    const columnCosines = imageOrientation.slice(3);

    const rowString =
        getOrientationString(rowCosines);

    const columnString =
        getOrientationString(columnCosines);



    const oppositeRowString =
        invertOrientationString(rowString);

    const oppositeColumnString =
        invertOrientationString(columnString);



    const markers = {

        top: oppositeColumnString,

        bottom: columnString,

        left: oppositeRowString,

        right: rowString

    }

    return markers

}
