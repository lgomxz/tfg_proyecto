// cohens_kappa.ts
// github: https://github.com/aaronnorby/cohens-kappa-JS?
export class Cohen {
  weighted(
    rater1: { [key: string]: number },
    rater2: { [key: string]: number },
    weights: 'linear' | 'squared',
    numOfCategories: number
  ): number {
    function squareMatrix(size: number, defaultValue: number): number[][] {
      const ary: number[][] = new Array(size);
      for (let i = 0; i < size; i++) {
        ary[i] = new Array(size).fill(defaultValue);
      }
      return ary;
    }

    const observed = squareMatrix(numOfCategories, 0);
    const hypothetical = squareMatrix(numOfCategories, 0);
    const weightMatrix = squareMatrix(numOfCategories, 0);

    // Build observed matrix
    for (const item in rater1) {
      if (
        Object.prototype.hasOwnProperty.call(rater1, item) &&
        Object.prototype.hasOwnProperty.call(rater2, item)
      ) {
        const rater1Rating = rater1[item] - 1;
        const rater2Rating = rater2[item] - 1;
        observed[rater1Rating][rater2Rating] += 1;
      }
    }

    function rev1Totals(category: number, obs: number[][]): number {
      category = category - 1;
      return obs[category].reduce((sum, n) => sum + n, 0);
    }

    function rev2Totals(category: number, obs: number[][]): number {
      category = category - 1;
      let count = 0;
      for (let i = 0; i < obs.length; i++) {
        count += obs[i][category];
      }
      return count;
    }

    let totalRatings = 0;
    for (let category = 1; category <= numOfCategories; category++) {
      totalRatings += rev1Totals(category, observed);
    }

    // Build hypothetical matrix
    for (let i = 0; i < observed.length; i++) {
      for (let j = 0; j < observed[i].length; j++) {
        hypothetical[i][j] =
          (rev1Totals(i + 1, observed) * rev2Totals(j + 1, observed)) /
          totalRatings;
      }
    }

    // Build weight matrix
    for (let i = 0; i < weightMatrix.length; i++) {
      for (let j = 0; j < weightMatrix.length; j++) {
        if (weights === 'squared') {
          weightMatrix[i][j] =
            1 - Math.pow(i + 1 - (j + 1), 2) / Math.pow(numOfCategories - 1, 2);
        } else {
          // linear weights
          weightMatrix[i][j] =
            1 - Math.abs(i + 1 - (j + 1)) / (numOfCategories - 1);
        }
      }
    }

    function kappa(): number {
      let propObs = 0;
      for (let i = 0; i < observed.length; i++) {
        for (let j = 0; j < observed[i].length; j++) {
          propObs += (observed[i][j] / totalRatings) * weightMatrix[i][j];
        }
      }

      let propHyp = 0;
      for (let i = 0; i < hypothetical.length; i++) {
        for (let j = 0; j < hypothetical[i].length; j++) {
          propHyp += (hypothetical[i][j] / totalRatings) * weightMatrix[i][j];
        }
      }

      return (propObs - propHyp) / (1 - propHyp);
    }

    return Math.round(kappa() * 100) / 100;
  }

  unweighted(
    rater1: { [key: string]: number },
    rater2: { [key: string]: number },
    numOfCategories: number
  ): number {
    function squareMatrix(size: number, defaultValue: number): number[][] {
      const ary: number[][] = new Array(size);
      for (let i = 0; i < size; i++) {
        ary[i] = new Array(size).fill(defaultValue);
      }
      return ary;
    }

    const observed = squareMatrix(numOfCategories, 0);
    const hypothetical = squareMatrix(numOfCategories, 0);

    // Build observed matrix
    for (const item in rater1) {
      if (
        Object.prototype.hasOwnProperty.call(rater1, item) &&
        Object.prototype.hasOwnProperty.call(rater2, item)
      ) {
        const rater1Rating = rater1[item] - 1;
        const rater2Rating = rater2[item] - 1;
        observed[rater1Rating][rater2Rating] += 1;
      }
    }

    function rev1Totals(category: number, obs: number[][]): number {
      category = category - 1;
      return obs[category].reduce((sum, n) => sum + n, 0);
    }

    function rev2Totals(category: number, obs: number[][]): number {
      category = category - 1;
      let count = 0;
      for (let i = 0; i < obs.length; i++) {
        count += obs[i][category];
      }
      return count;
    }

    let totalRatings = 0;
    for (let category = 1; category <= numOfCategories; category++) {
      totalRatings += rev1Totals(category, observed);
    }

    // Build hypothetical matrix diagonal
    for (let i = 0; i < observed.length; i++) {
      hypothetical[i][i] =
        (rev1Totals(i + 1, observed) * rev2Totals(i + 1, observed)) /
        totalRatings;
    }

    function agree(matrix: number[][]): number {
      let agrees = 0;
      for (let i = 0; i < matrix.length; i++) {
        agrees += matrix[i][i];
      }
      return agrees;
    }

    function kappa(): number {
      const obsAgreement = agree(observed);
      const hypAgreement = agree(hypothetical);
      return (obsAgreement - hypAgreement) / (totalRatings - hypAgreement);
    }

    return Math.round(kappa() * 100) / 100;
  }

  kappa(
    reviewer1: { [key: string]: number },
    reviewer2: { [key: string]: number },
    numOfCategories: number,
    weights?: 'none' | 'linear' | 'squared'
  ): number | Error {
    if (
      Object.keys(reviewer1).length < 2 ||
      Object.keys(reviewer2).length < 2
    ) {
      return new Error('Each rater must have >1 rating.');
    }

    if (!weights || weights === 'none') {
      return this.unweighted(reviewer1, reviewer2, numOfCategories);
    } else if (weights === 'linear' || weights === 'squared') {
      return this.weighted(reviewer1, reviewer2, weights, numOfCategories);
    } else {
      throw new Error(
        "Invalid weight param: Weight must be 'none', 'linear', or 'squared'"
      );
    }
  }

  nominalConversion(
    nominalCats: string[],
    nominalRatings: { [key: string]: string }
  ): { [key: string]: number } {
    const conversion: { [key: string]: number } = {};
    for (let i = 0; i < nominalCats.length; i++) {
      conversion[nominalCats[i]] = i + 1;
    }

    const numericRatings: { [key: string]: number } = {};
    for (const item in nominalRatings) {
      if (
        !Object.prototype.hasOwnProperty.call(conversion, nominalRatings[item])
      ) {
        throw new Error('Category array must contain all categories.');
      }
      numericRatings[item] = conversion[nominalRatings[item]];
    }

    return numericRatings;
  }
}
