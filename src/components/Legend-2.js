import '../world-states.svg'
import 'react-minimal-side-navigation/lib/ReactMinimalSideNavigation.css';
import Countries from './Countries';
import React, { Component, useState } from 'react';
import './Navigator'
import { CompactPicker, SketchPicker } from 'react-color'
import Navigator from './Navigator';



 

function Legend2({
    legend1CountryValue, 
    setLegend1CountryValue, 
    legend2CountryValue,
    setLegend2CountryValue,
    legend3CountryValue,
    setLegend3CountryValue,
    legend4CountryValue,
    setLegend4CountryValue,
    legend5CountryValue,
    setLegend5CountryValue,



    activeLegend, 
    legend2ColorValue, 
    setLegend2ColorValue, 
    legend2TitleValue, 
    handleTitle2ValueChange,
    showLabel2,
    setShowLabel2

}) {

    



   

    const handleColorChange = (color) =>{
        setLegend2ColorValue(color.hex)
        for (var i = 0; i < legend2CountryValue.length; i++) {
            const id = legend2CountryValue[i];
            document.getElementById(id).style.fill = color.hex;
          }

    }

    const handleTitle2Change = (event) => {
        handleTitle2ValueChange(event.target.value)
    }


   
    if (activeLegend !== 'legend2') {
        return null
    } 
        
        
        
    return(
        <div>
            <div className='legend'>


                <div className='legend-set'>
                    
                    <div className='legend-title'>
                        
                        <input 
                            value={legend2TitleValue !== "Legend 2" ? legend2TitleValue : ""}  
                            className='legend-title' 
                            placeholder="Legend's Title" 
                            onChange={handleTitle2Change}
                            type='text'
                            ></input>

                            <div className='legend-show'>
                            <input 
                                type='checkbox'
                                onChange={(e) => setShowLabel2(e.target.checked)}
                                checked={showLabel2}
                                >

                            </input>
                            <label>Show label on map</label>
                        </div>
                    </div>


                    <CompactPicker 
                        className='color-picker'
                        color={legend2ColorValue}
                        value={legend2ColorValue}
                        onChangeComplete={handleColorChange} 
                        
                        />
                    
                   
                    
                </div>
             
                    <Countries
                    legend2ColorValue={legend2ColorValue}
                    setLegend2ColorValue={setLegend2ColorValue}
                    legend={2}
                    
                    legend1CountryValue={legend1CountryValue}
                    setLegend1CountryValue={setLegend1CountryValue}
                    
                    legend2CountryValue={legend2CountryValue}
                    setLegend2CountryValue={setLegend2CountryValue}
                    
                    legend3CountryValue={legend3CountryValue}
                    setLegend3CountryValue={setLegend3CountryValue}

                    legend4CountryValue={legend4CountryValue}
                    setLegend4CountryValue={setLegend4CountryValue}

                    legend5CountryValue={legend5CountryValue}
                    setLegend5CountryValue={setLegend5CountryValue}
                    
                    


                    
                    
                />
              
                
            </div>
            
            
        </div>
    )

   
}

export default Legend2