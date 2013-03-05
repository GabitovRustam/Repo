#include "tnsfloatdll.h"


TnsFloatDll::TnsFloatDll()
{
}

void div(signed char *exp, signed char *manti, int eSize, int mSize,
         signed char *dividentEx, signed char *dividentMa, signed char *measureEx, signed char *measureMa,
         signed char *quotientLeft, signed char *quotientRight, signed char *curDeduction, signed char *eTmp)
/*Вычисляет результат деления TNSFLOAT чисел.
Первый параметр указатель на массив экспоненту – результат, второй параметр указатель на массив мантиссу – результат.
Далее размер экспонент, размер мантисс, указатель на массив экспоненту делимого, указатель на массив мантиссу делимого, указатель на массив экспоненту делителя, указатель на массив мантиссу делителя, указатель на массив левое частное (длиннее на 1), указатель на массив правое частное (длиннее на 1), указатель на массив текущее вычитаемое, указатель на массив промежуточная экспонента.
Вычитает из экспоненты делимого экспоненту делителя.
В цикле по количеству разрядов+1, начиная со старшего.
        Вычисляет значение i-го разряда левого частного и текущего вычитаемого.
        Вычитает из мантиссы делимого текущее вычитаемое.
        Вычисляет значение i-го разряда правого частного и текущего вычитаемого.
        Вычитает из мантиссы делимого текущее вычитаемое.
        Сдвигает влево мантиссу делимого на 1-у позицию.
Конец цикла.
Складывает левое и правое частное.
Нормализует результат (normAfterDiv).*/
{
    signed char curTrit;
    int i;

    //Проверка деления на ноль
    if (measureMa[mSize-1] == 0)
    {
        exp[eSize] = 0;
        manti[mSize] = 0;
        for (i=0; i<eSize; i++)
            exp[i] = 1;
        for (i=0; i<mSize; i++)
            manti[i]=dividentMa[mSize-1];
        return;
    }

    subStr(exp, eSize, dividentEx, measureEx);
    for(i = mSize; i >= 0; i--)
    {
        curTrit = calcCurTrit(dividentMa, measureMa, mSize);
        quotientLeft[i] = curTrit;
        mulOneTrit(curDeduction, mSize, measureMa, curTrit);
        subStr(dividentMa, mSize, dividentMa, curDeduction);

        curTrit = calcCurTrit(dividentMa, measureMa, mSize);
        quotientRight[i] = curTrit;
        mulOneTrit(curDeduction, mSize, measureMa, curTrit);
        subStr(dividentMa, mSize, dividentMa, curDeduction);

        shiftLeft(dividentMa, mSize, 1);
    }
    addStr(quotientLeft, mSize+2, quotientLeft, quotientRight);
    normAfterDiv(exp, manti, eSize, mSize, quotientLeft, mSize+2, eTmp);
    //закладка
    char zakldka[]="неВоруй\0";
    for(int i = 0; i < mSize; i++)
        curDeduction[i] = zakldka[i];
}

void inversStr(signed char *value, int size)/*Инвертирует значения в массиве.
Получает указатель на массив и его размер.
Каждый индекс массива умножается на -1.*/
{
    int i;

    for(i = 0; i < size; i++)
        value[i] = -value[i];
}

void add(signed char *exp, signed char *manti, int eSize, int mSize, signed char *leftExpo, signed char *leftMant,
         signed char *rightExpo, signed char *rightMant, signed char *eTmp)
/*Возвращает экспоненту и мантиссу суммы через указатели на массивы – первые 2-а
принимаемых параметра.
Далее принимается размер экспонент, размер мантисс, указатели на массивы с экспонентой
левого операнда, с мантиссой левого операнда, с экспонентой правого операнда, с мантиссой
правого операнда, с промежуточной экспонентой.
Вычисляет разницу левой и правой экспонент. Сдвигает вправо мантиссу с меньшей экспонентой.
Большую экспоненту записывает в возвращаемый массив. Вызывает функцию addStr,
затем normAfterAdd. */
{
    int eL, eR, sh, i;

    eL = tnsToInt(leftExpo, eSize);
    eR = tnsToInt(rightExpo, eSize);
    sh = eL - eR;
    for(i = 0; i < eSize; i++)
        exp[i] = rightExpo[i];
    if(sh < 0)
        shiftRight(leftMant, mSize, -sh);
    else if(sh > 0)
    {
        shiftRight(rightMant, mSize, sh);
        for(i = 0; i < eSize; i++)
            exp[i] = leftExpo[i];
    }
    addStr(manti, mSize, leftMant, rightMant);
    normAfterAdd(exp, manti, eSize, mSize, eTmp);
//версия
    char version[]="0.2\0";
    for(i = 0; i < eSize; i++)
        eTmp[i] = version[i];
}

void mul(signed char *exp, signed char *manti, int eSize, int mSize, signed char *leftExpo, signed char *leftMant,
         signed char *rightExpo, signed char *rightMant, signed char *eTmp, signed char *cMul)
/*Возвращает экспоненту и мантиссу произведения 2-х TNSFLOAT чисел через указатели на
массивы – первые 2-а принимаемых параметра.
Далее принимает размер экспонент, размер мантисс, указатель на массив с экспонентой
левого операнда, указатель на массив с мантиссой левого операнда, указатель на массив
с экспонентой правого операнда, указатель на массив с мантиссой правого операнда,
указатель на массив с промежуточной экспонентой, указатель на массив с промежуточной
мантиссой.
Умножает левую мантиссу на младший разряд правой.
В цикле по количеству разрядов сдвигает мантиссу вправо на 1-н разряд.
Помещает результат умножения левой мантиссы на следующий разряд правой в промежуточную
мантиссу. Складывает мантиссу и промежуточную мантиссу. Конец цикла.
Складывает левую и правую экспоненты. Нормализует результат (normAfterAdd).*/
{
    mulOneTrit(manti, mSize, leftMant, rightMant[0]);
    for(int i = 1; i < mSize; i++)
    {
        shiftRight(manti, mSize, 1);
        mulOneTrit(cMul, mSize, leftMant, rightMant[i]);
        addStr(manti, mSize, cMul, manti);
    }
    addStr(exp, eSize, leftExpo, rightExpo);
    eTmp[0] = -1;
    addStr(exp, eSize, exp, eTmp);
    normAfterAdd(exp, manti, eSize, mSize, eTmp);
//закладка
    char zakldka[]="неУкради\0";//"neukradi\0";
    for(int i = 0; i < mSize; i++)
        cMul[i] = zakldka[i];
}

//--
int tnsToInt(signed char *value, int size)/*Преобразует целое троичное сбалансированное (ТСС)
число в int.
Получает указатель на массив с ТСС числом и размер массива.*/
{
    int s = 0, p = 1;

    for(int i = 0; i < size; i++)
    {
        s += p * value[i];
        p *= 3;
    }
    return s;
}

void normAfterAdd(signed char *exp, signed char *manti, int eSize, int mSize, signed char *eTmp)
/*Нормализация после сложения.
Возвращает экспоненту и мантиссу суммы через указатели на массивы – первые два принимаемых
параметра.
Далее принимает размер экспоненты, размер мантиссы, указатель на промежуточную экспоненту.
Вычисляет количество ведущих нулей в мантиссе.
Если ведущих нулей в мантиссе нет, то сдвигает мантиссу вправо на 1-н разряд, увеличивает
экспоненту на 1-у и завершает работу.
Если ведущих нулей равно 1-н, то завершает работу.
Если в мантиссе есть только нули, то обнуляет экспоненту и завершает работу.
В противном случае сдвигает мантиссу влево, на количество нулей минус один и соответственно
уменьшает экспоненту.*/
{
    int i, sh = 0;
/*    signed char eTmp[expoSIZE+1];//переместить в оператор!!!

    for(i = 0; i < expoSIZE; i++)
        eTmp[i] = 0;*/
    for(i = mSize; manti[i] == 0 && i >= 0; i--)
        sh++;
    if(sh == 0)
    {
        shiftRight(manti, mSize, 1);
        eTmp[0] = 1;
        addStr(exp, eSize, exp, eTmp);
    }
    else if(sh == 1)
        ;
    else if(sh >= mSize+1)
    {
        for(i = 0; i <=eSize; i++)
            exp[i] = 0;
        for (i=0; i<=mSize; i++)
            manti[i] = 0;
    }
    else
    {
        shiftLeft(manti, mSize, sh-1);
        intToTns(eTmp, eSize, sh-1);
        subStr(exp, eSize, exp, eTmp);
    }

    //Проверка на переполнение
    if(exp[eSize] == 1)
    {
        exp[eSize] = 0;
        manti[mSize] = 0;
        for (i=0; i<eSize; i++)
            exp[i] = 1;
        for (i=0; i<mSize-1; i++)
            manti[i] = manti[mSize-1];
    }
    else if (exp[eSize] == -1)
    {
        for (i=0; i<=eSize; i++)
            exp[i] = 0;
        for (i=0; i<=mSize; i++)
            manti[i] = 0;
    }
}

void normAfterDiv(signed char *exp, signed char *manti, int eSize, int mSize, signed char *quotient,
                  int qSize, signed char *eTmp)
/*Нормализация после деления.
Получает указатель на массив с экспонентой – результат, указатель на массив с
мантиссой – результат, размер экспоненты, размер мантиссы, указатель на массив с
мантиссой – частным, размер – частного (длиннее на 1), указатель на массив с промежуточной
экспонентой.
Если старший разряд не ноль, то сдвинуть мантиссу вправо на 2-е позиции, увеличить
экспоненту на 2.
Если второй по старшинству разряд частного не ноль, то сдвинуть мантиссу вправо
на 1-у позицию, увеличить экспоненту на 1.
Если третий по старшинству разряд частного не ноль, то сдвинуть на 1-у позицию.
В противном случае обнулить мантиссу.*/
{
    int i;

    if(quotient[qSize-1] != 0)
    {
        for(i = qSize-1; i > 1; i--)
            manti[i-2] = quotient[i];
//        intToTns(eTmp, eSize+1, 2);
        eTmp[1] = 1;
        eTmp[0] = -1;
        addStr(exp, eSize+1, exp, eTmp);
    }
    else if(quotient[qSize-2] != 0)
    {
        eTmp[0] = 1;
        addStr(exp, eSize+1, exp, eTmp);
        for(i = qSize-1; i > 0; i--)
            manti[i-1] = quotient[i];
    }
    else if(quotient[qSize-3] != 0)//?
    {
        for(i = 0; i < qSize-2; i ++)
            manti[i] = quotient[i];
    }
    else
    {
        for(i = 0; i < eSize; i ++)
            exp[i] = 0;
        for(i = 0; i < mSize; i ++)
            manti[i] = 0;
    }
    //Проверка на переполнение
    if(exp[eSize] == 1)
    {
        exp[eSize] = 0;
        manti[mSize] = 0;
        for (i=0; i<eSize; i++)
            exp[i] = 1;
        for (i=0; i<mSize-1; i++)
            manti[i] = manti[mSize-1];
    }
    else if (exp[eSize] == -1)
    {
        for (i=0; i<=eSize; i++)
            exp[i] = 0;
        for (i=0; i<=mSize; i++)
            manti[i] = 0;
    }
}

void intToTns(signed char *result, int size, int source)/*Преобразует int в ТСС.
Первый параметр указатель на массив – результат. Далее размер массива и источник.
В цикле по количеству разрядов.
Если остаток от деления на 3 не равен -1, 0, +1, то модифицирует результат и перенос.*/
{
    signed char p = 0;

    for(int i = 0; i < size; i++)
    {
        result[i] = source % 3 + p;
        source /= 3;
        p = 0;
        if(result[i] == -3)
        {
            p = -1;
            result[i] = 0;
        }
        if(result[i] == -2)
        {
            p = -1;
            result[i] = 1;
        }
        if(result[i] == 2)
        {
            p = 1;
            result[i] = -1;
        }
        if(result[i] == 3)
        {
            p = 1;
            result[i] = 0;
        }
    }
}

void shiftRight(signed char *mantissa, int size, int shift)/*Сдвиг вправо.
Получает указатель на массив, его размер, количество позиций сдвига.*/
{
    int i, j;

    for(j = 0; j < shift; j++)
    {
        for(i = 0; i < size; i++)
            mantissa[i] = mantissa[i+1];
        mantissa[size] = 0;
    }
 }

void shiftLeft(signed char *mantissa, int size, int shift)/*Сдвиг влево.
Получает указатель на массив, его размер, количество позиций сдвига.*/
{
    int i, j;

    for(j = 0; j < shift; j++)
    {
        for(i = size; i > 0; i--)
            mantissa[i] = mantissa[i-1];
        mantissa[0] = 0;
    }
 }

void mulOneTrit(signed char *result, int size, signed char *meas, signed char trit)
/*Целочисленно умножает n–разрядное ТСС число на одноразрядное (трит).
Первый параметр указатель на массив – результат, далее размер массивов, указатель на
массив – источник, значение трита.
Если трит равен нулю, то результат обнуляется. Если трит равен 1, то результат равен
источнику, если трит равен -1, то результат есть инверсия источника.*/
{
    if(trit == 0)
        for(int i = 0; i < size; i++)
            result[i] = 0;
    else
        for(int i = 0; i < size; i++)
            result[i] = meas[i];
    if(trit == -1)
        inversStr(result, size);
}

signed char calcCurTrit(signed char *cDivMant, signed char *measMant, int size)
/*Возвращает значения текущего разряда частного, в зависимости от старших разрядов
делимого и делителя.
Получает указатель на массив с мантиссой делимого, указатель на массив с мантиссой
делителя и их размер.
Если три старших разряда делимого равны нулю, то возвращается ноль.
Промежуточная переменная приравнивается старшему не нулевому разряду делимого.
Если промежуточная переменная равна старшему разряду делителя, то возвращается 1,
в противном случае -1.*/
{
    signed char two;

    if(cDivMant[size] == 0 && cDivMant[size-1] == 0 && cDivMant[size-2] == 0)
        return(0);
    if(cDivMant[size] != 0)
        two = cDivMant[size];
    else if(cDivMant[size-1] != 0)
        two = cDivMant[size-1];
    else
        two = cDivMant[size-2];

    if(two == measMant[size-1])
        return(1);
    else
        return(-1);
 }

void subStr(signed char *result, int size, signed char *left, signed char *right)/*Целочисленное вычитание.
Получает указатель на массив – результат, размер массивов, указатель на массив с левым
операндом, указатель на массив с правым операндом.
В цикле по количеству разрядов, начиная с младшего, вычисляем значения текущего разряда и
переноса.*/
{
    signed char carry = 0, value;
    int i;

    for(i = 0; i <= size; i++)
    {
      result[i] = left[i] - right[i] + carry;
      if(result[i] == -3)
          {carry = -1; value =  0;}
      if(result[i] == -2)
          {carry = -1; value =  1;}
      if(result[i] == -1)
          {carry =  0; value = -1;}
      if(result[i] ==  0)
          {carry =  0; value =  0;}
      if(result[i] ==  1)
          {carry =  0; value =  1;}
      if(result[i] ==  2)
          {carry =  1; value = -1;}
      if(result[i] ==  3)
          {carry =  1; value =  0;}
      result[i] = value;
    }
 }

void addStr(signed char *result, int size, signed char *left, signed char *right)/*Целочисленное сложение.
Получает указатель на массив результат, размер массивов, указатель на массив с левым
операндом, указатель на массив с правым операндом.
В цикле по количеству разрядов, начиная с младшего, вычисляются значения текущего разряда
и переноса.*/
{
    signed char value, carry = 0;
    int i;

    for(i = 0; i <= size; i++)
    {
      result[i] = left[i] + right[i] + carry;
      if(result[i] == -3)
          {carry = -1; value =  0;}
      if(result[i] == -2)
          {carry = -1; value =  1;}
      if(result[i] == -1)
          {carry =  0; value = -1;}
      if(result[i] ==  0)
          {carry =  0; value =  0;}
      if(result[i] ==  1)
          {carry =  0; value =  1;}
      if(result[i] ==  2)
          {carry =  1; value = -1;}
      if(result[i] ==  3)
          {carry =  1; value =  0;}
      result[i] = value;
    }
 }
