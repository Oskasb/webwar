"use strict";


define([], function(

) {


    var ObjectComparator = function() {

    };


    ObjectComparator.trueIfEqualObjects = function(a, b) {

        function compareLevel4(a4, b4) {
            for (var key in b4) {
                if (b4[key] === a4[key]) {

                } else {
                    return false;
                }
                return true;
            }
        }



        function compareLevel3(a3, b3) {
            for (var key in b3) {
                if (b3[key] === a3[key]) {

                    if (compareLevel4(a3[key], b3[key])) {

                    } else {
                        return false;
                    }

                } else {
                    return false;
                }
                return true;
            }
        }



        function compareLevel2(a2, b2) {

            for (var key in b2) {
                if (b2[key] === a2[key]) {

                    if (!a2[key]) return false;
                    if (!b2[key]) return false;

                    if (compareLevel3(a2[key], b2[key])) {

                    } else {
                        return false;
                    }

                } else {
                    return false;
                }
                return true;
            }
        }

        for (var key in b) {
            if (!a) return false;
            if (!b) return false;
            if (a[key] === b[key]) {

                if (!a[key]) return false;
                if (!b[key]) return false;

                if (compareLevel2(a[key], b[key])) {

                } else {
                    return false
                };

            } else {
                return false;
            }
        };

        return true;

    };




    return ObjectComparator;

});