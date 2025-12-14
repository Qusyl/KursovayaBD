using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KursovayaBD.Models
{
    [Table("ownings",Schema ="public")]
    public class OwningsModel
    {
        [Key]
        [Required]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("shop")]

        public int Shop { get; set; }

        [Required]
        [Column("owner")]
        public int Owner { get; set; }

        [Column("holding")]
        public decimal Holding { get; set; } = decimal.Zero;

        [ForeignKey("fk_owner")]
        public OwnerModel OwnerFK { get; set; } = null!;

        [ForeignKey("fk_shop")]

        public ShopModel ShopFK { get; set; } = null!;  

    }
}
