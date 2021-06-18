import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CalculateService {
  constructor() {}

  /*
  6축 로봇 계산식
*/
  private length2(a, b) {
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
  }

  private length3(vector) {
    return Math.sqrt(
      Math.pow(vector[0], 2) + Math.pow(vector[1], 2) + Math.pow(vector[2], 2)
    );
  }
  private cross(vectorA, vectorB, result = []) {
    result[0] = vectorA[1] * vectorB[2] - vectorA[2] * vectorB[1];
    result[1] = vectorA[2] * vectorB[0] - vectorA[0] * vectorB[2];
    result[2] = vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0];
    return result;
  }

  private angleBetween(vectorA, vectorB, referenceVector) {
    const norm = this.length3(this.cross(vectorA, vectorB));
    const angle = Math.atan2(
      norm,
      vectorB[0] * vectorA[0] +
        vectorB[1] * vectorA[1] +
        vectorB[2] * vectorA[2]
    );
    const tmp =
      referenceVector[0] * vectorA[0] +
      referenceVector[1] * vectorA[1] +
      referenceVector[2] * vectorA[2];
    const sign = tmp > 0.0001 ? 1.0 : -1.0;
    return angle * sign;
  }

  private angleBetween2(v1, v2) {
    let angle;
    const crossV = this.cross(v1, v2);
    return Math.atan2(this.length3(crossV), this.dot(v1, v2));
  }

  private dot(vectorA, vectorB) {
    return (
      vectorA[0] * vectorB[0] +
      vectorA[1] * vectorB[1] +
      vectorA[2] * vectorB[2]
    );
  }

  public calculateAngles(geometry, x, y, z, u, v, w) {
    const a = (w * Math.PI) / 180;
    const b = (v * Math.PI) / 180;
    const c = (u * Math.PI) / 180;
    let angles = [0, 0, 0, 0, 0, 0];

    const config = [false, false, false];
    const OK = 0;
    const OUT_OF_RANGE = 1;
    const OUT_OF_BOUNDS = 2;

    const V1_length_x_z = Math.sqrt(
      Math.pow(geometry[1][0], 2) + Math.pow(geometry[1][2], 2)
    );
    const V4_length_x_y_z = Math.sqrt(
      Math.pow(geometry[4][0], 2) +
        Math.pow(geometry[4][2], 2) +
        Math.pow(-geometry[4][1], 2)
    );

    let J_initial_absolute = [];
    const tmpPos = [0, 0, 0];
    for (let i = 0; i < geometry.length; i++) {
      J_initial_absolute.push([tmpPos[0], tmpPos[1], tmpPos[2]]);
      tmpPos[0] += geometry[i][0];
      tmpPos[1] += geometry[i][1];
      tmpPos[2] += geometry[i][2];
    }

    let R_corrected = [0, 0, 0, 0, 0, 0];
    R_corrected[1] += Math.PI / 2;
    R_corrected[1] -= Math.atan2(geometry[1][0], geometry[1][2]);

    R_corrected[2] += Math.PI / 2;
    R_corrected[2] += Math.atan2(
      geometry[2][2] + geometry[3][2],
      geometry[2][0] + geometry[3][0]
    );
    R_corrected[2] += Math.atan2(geometry[1][0], geometry[1][2]);

    R_corrected[4] += Math.PI;

    const cc = Math.cos(c);
    const sc = Math.sin(c);
    const cb = Math.cos(b);
    const sb = Math.sin(b);
    const ca = Math.cos(a);
    const sa = Math.sin(a);

    const targetVectorZ = [sb, -sa * cb, ca * cb];

    const R = [
      R_corrected[0],
      R_corrected[1],
      R_corrected[2],
      R_corrected[3],
      R_corrected[4],
      R_corrected[5],
    ];

    const J = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    J[5][0] = x;
    J[5][1] = y;
    J[5][2] = z;

    J[4][0] = x - V4_length_x_y_z * targetVectorZ[0];
    J[4][1] = y - V4_length_x_y_z * targetVectorZ[1];
    J[4][2] = z - V4_length_x_y_z * targetVectorZ[2];

    const alphaR0 = Math.asin(
      J_initial_absolute[4][1] / this.length2(J[4][1], J[4][0])
    );
    R[0] += Math.atan2(J[4][1], J[4][0]);
    R[0] += -alphaR0;

    if (config[0]) {
      R[0] += 2 * alphaR0 - Math.PI;
    }

    if (-J_initial_absolute[4][1] > this.length2(J[4][2], J[4][0])) {
      //Serial.println("out of reach");
      console.log('out of reach');
    }

    J[1][0] =
      Math.cos(R[0]) * geometry[0][0] + Math.sin(R[0]) * -geometry[0][1];
    J[1][1] = Math.sin(R[0]) * geometry[0][0] + Math.cos(R[0]) * geometry[0][1];
    J[1][2] = geometry[0][2];

    const J4_x_z = [];

    J4_x_z[0] = Math.cos(R[0]) * J[4][0] + Math.sin(R[0]) * J[4][1];
    J4_x_z[1] = Math.sin(R[0]) * J[4][0] + Math.cos(R[0]) * -J[4][1];
    J4_x_z[2] = J[4][2];

    const J1J4_projected_length_square =
      Math.pow(J4_x_z[0] - J_initial_absolute[1][0], 2) +
      Math.pow(J4_x_z[2] - J_initial_absolute[1][2], 2);

    const J2J4_length_x_z = this.length2(
      geometry[2][0] + geometry[3][0],
      geometry[2][2] + geometry[3][2]
    );
    R[2] +=
      ((config[1] ? !config[0] : config[0]) ? 1.0 : -1.0) *
      Math.acos(
        (-J1J4_projected_length_square +
          Math.pow(J2J4_length_x_z, 2) +
          Math.pow(V1_length_x_z, 2)) /
          (2.0 * J2J4_length_x_z * V1_length_x_z)
      );
    R[2] -= 2 * Math.PI;

    R[2] = ((R[2] + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

    const J1J4_projected_length = Math.sqrt(J1J4_projected_length_square);
    R[1] -= Math.atan2(
      J4_x_z[2] - J_initial_absolute[1][2],
      J4_x_z[0] - J_initial_absolute[1][0]
    );
    R[1] +=
      ((config[1] ? !config[0] : config[0]) ? 1.0 : -1.0) *
      Math.acos(
        (J1J4_projected_length_square -
          Math.pow(J2J4_length_x_z, 2) +
          Math.pow(V1_length_x_z, 2)) /
          (2.0 * J1J4_projected_length * V1_length_x_z)
      );

    R[1] = ((R[1] + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

    const ta = Math.cos(R[0]);
    const tb = Math.sin(R[0]);
    const tc = geometry[0][0];
    const d = geometry[0][2];
    const e = -geometry[0][1];
    const f = Math.cos(R[1]);
    const g = Math.sin(R[1]);
    const h = geometry[1][0];
    const i = geometry[1][2];
    const j = -geometry[1][1];
    const k = Math.cos(R[2]);
    const l = Math.sin(R[2]);
    const m = geometry[2][0];
    const n = geometry[2][2];
    const o = -geometry[2][1];

    J[2][0] = ta * tc + tb * e + ta * f * h - ta * -g * i + tb * j;
    J[2][1] = -(-tb * tc + ta * e - tb * f * h + tb * -g * i + ta * j);
    J[2][2] = d + -g * h + f * i;

    J[3][0] =
      J[2][0] +
      ta * f * k * m -
      ta * -g * -l * m -
      ta * -g * k * n -
      ta * f * -l * n +
      tb * o;
    J[3][1] =
      J[2][1] -
      (-tb * f * k * m +
        tb * -g * -l * m +
        tb * -g * k * n +
        tb * f * -l * n +
        ta * o);
    J[3][2] = J[2][2] + -g * k * m + f * -l * m + f * k * n + g * -l * n;

    const J4J5_vector = [
      J[5][0] - J[4][0],
      J[5][1] - J[4][1],
      J[5][2] - J[4][2],
    ];
    const J4J3_vector = [
      J[3][0] - J[4][0],
      J[3][1] - J[4][1],
      J[3][2] - J[4][2],
    ];

    const J4J5_J4J3_normal_vector = this.cross(J4J5_vector, J4J3_vector);

    const ZY_parallel_aligned_vector = [
      10 * -Math.sin(R[0]),
      10 * Math.cos(R[0]),
      0,
    ];

    const ZY_aligned_J4J3_normal_vector = this.cross(
      ZY_parallel_aligned_vector,
      J4J3_vector
    );

    R[3] = this.angleBetween(
      J4J5_J4J3_normal_vector,
      ZY_parallel_aligned_vector,
      ZY_aligned_J4J3_normal_vector
    );

    if (config[2]) {
      R[3] += Math.PI;
    }

    R[3] = ((R[3] + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

    R[4] += (config[2] ? 1 : -1) * this.angleBetween2(J4J5_vector, J4J3_vector);

    R[4] = ((R[4] + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

    const targetVectorY = [
      -cb * sc,
      ca * cc - sa * sb * sc,
      sa * cc + ca * sb * sc,
    ];

    R[5] -= this.angleBetween(
      J4J5_J4J3_normal_vector,
      targetVectorY,
      this.cross(targetVectorZ, targetVectorY)
    );

    if (config[2]) R[5] += Math.PI;

    R[5] = ((R[5] + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

    const error = false;
    const outOfBounds = [false, false, false, false, false, false];

    angles[0] = (R[0] * 180) / Math.PI;
    angles[1] = (R[1] * 180) / Math.PI;
    angles[2] = (R[2] * 180) / Math.PI;
    angles[3] = (R[3] * 180) / Math.PI;
    angles[4] = (R[4] * 180) / Math.PI;
    angles[5] = (R[5] * 180) / Math.PI;

    return angles;
  }

  /*
    4축 로봇 계산식
  */
  public calculate4robot(x, y, z, u) {
    const l1 = 325;
    const l2 = 275;
    const c2 =
      (Math.pow(x, 2) + Math.pow(y, 2) - Math.pow(l1, 2) - Math.pow(l2, 2)) /
      (2 * l1 * l2);
    //이부분!!
    const s2 = Math.sqrt(1 - Math.pow(c2, 2));
    // console.log("c2==>" + c2);
    // console.log("s2==>" + s2);

    const theta2 = (Math.atan2(s2, c2) * 180) / Math.PI;
    const theta1 =
      ((Math.atan2(y, x) - Math.atan2(l2 * s2, l1 + l2 * c2)) * 180) / Math.PI;
    const theta3 = u - theta1 - theta2;

    const result = {
      theta1: theta1,
      theta2: theta2,
      theta3: theta3,
      z: z,
    };
    return result;
  }
}
