using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KursovayaBD.Models
{
    [Table("owner", Schema ="public")]
    public class OwnerModel
    {
        [Key]
        [Required]
        [Column("id")]
        public int Id { get; set; }

        [Column("owner_name")]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [Column("owner_surname")]
        [MaxLength(50)]

        public string Surname { get; set; } = string.Empty;

        [Column("owner_lastname")]
        [MaxLength(50)] 

        public string Lastname { get; set; } = string.Empty;

        [Column("address")]
        [MaxLength(100)]

        public string Address { get; set;} = string.Empty;


        [Column("phone")]
        [MaxLength(12)]

        public string Phone { get; set; } = string.Empty;   
    }
}
