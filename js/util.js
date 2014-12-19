/**
 * This function contains the code necessary for subclassing and should be called
 * immediately following the creation of a class constructor for a class that wants
 * to be a subclass of another and inherit its properties and methods
 *
 * e.g.
 * ANewSubClass = function() {}
 * ANewSubClass.inheritsFrom(ExistingClass)
 *
 * @param the superclass this class wants to inherit from
 * @return the subclass
 */
Function.prototype.inheritsFrom = function( parentClassOrObject ){ 
	if ( parentClassOrObject.constructor == Function ) 
	{ 
		//Normal Inheritance 
		this.prototype = new parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	} 
	else 
	{ 
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	} 
	return this;
}

